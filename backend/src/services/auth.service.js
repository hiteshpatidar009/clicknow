import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { appConfig } from "../config/index.js";
import { firebaseDatabase } from "../database/index.js";
import { userRepository } from "../repositories/index.js";
import otpService from "./otp.service.js";
import Logger from "../utils/logger.util.js";
import {
  AuthenticationError,
  ServiceUnavailableError,
  UserNotFoundError,
  UserAlreadyExistsError,
  UserInactiveError,
} from "../utils/errors.util.js";

class AuthService {
  constructor() {
    this.jwtSecret = appConfig.jwt.secret;
    this.jwtExpiresIn = appConfig.jwt.expiresIn;
    this.refreshSecret = appConfig.jwt.refreshSecret;
    this.refreshExpiresIn = appConfig.jwt.refreshExpiresIn;
    this.devFallbackUserId = "dev-local-user";
  }

  /**
   * Register a new user
   */
  /**
   * Register a new user
   *
   * ✅ DESIGN DECISION:
   * Everyone registers as role='client' regardless of their intent.
   * A client who wants to be a professional completes onboarding AFTER login
   * via POST /professionals — that flow upgrades the role to 'professional'.
   * Admin can SUSPEND a professional, which downgrades role back to 'client'.
   */
  async register(userData) {
    const { email, phone, password, fullName } = userData;
    // role is always 'client' — never accepted from request body
    const role = 'client';
    const nameParts = this.resolveNameParts({ fullName });

    if (email) {
      const existingUser = await userRepository.findByEmail(email);
      if (existingUser) {
        throw new UserAlreadyExistsError();
      }
    }

    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 12);
    }

    const userDataToSave = this.buildUserPayload({
      email,
      phone,
      password: hashedPassword,
      fullName: nameParts.fullName,
      firstName: nameParts.firstName,
      lastName: nameParts.lastName,
      role, // always 'client'
    });

    const user = await userRepository.create(userDataToSave);
    Logger.logAuth('register', user.id, true, { role });

    // Send email OTP for verification
    if (email) {
      await this.sendOtp({ email, role });
    }

    const tokens = this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
      message: 'Registration successful. Please verify your email.',
      requireEmailVerification: !!email,
    };
  }

  /**
   * Login with email and password
   */
  async loginWithEmail(email, password) {
    // Dev-only fallback: allows local auth even when Firestore quota is exhausted.
    if (this.shouldUseDevAuthFallback() && this.matchesDevCredentials(email, password)) {
      return this.loginWithDevFallback(email);
    }

    let user;
    try {
      user = await userRepository.findByEmail(email);
    } catch (error) {
      if (error instanceof ServiceUnavailableError && this.shouldUseDevAuthFallback()) {
        Logger.warn("Firestore unavailable. Switching to dev auth fallback.", {
          email: (email || "").toLowerCase(),
        });
        return this.loginWithDevFallback(email || this.getDevEmail());
      }
      throw error;
    }

    if (!user) {
      throw new AuthenticationError("Invalid credentials");
    }

    if (!user.isActive) {
      throw new UserInactiveError();
    }
    
    // Check verification for clients??
    // if (user.role === 'client' && !user.isVerified) {
    //  throw new AuthenticationError("Email not verified");
    // }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      Logger.logAuth("login", user.id, false, { reason: "invalid_password" });
      throw new AuthenticationError("Invalid credentials");
    }

    await userRepository.updateLastLogin(user.id);

    Logger.logAuth("login", user.id, true);

    const tokens = this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async loginWithFirebase(firebaseToken) {
    if (!firebaseToken) {
      throw new AuthenticationError("Firebase token is required");
    }

    let decodedToken;
    try {
      decodedToken = await firebaseDatabase.getAuth().verifyIdToken(firebaseToken);
    } catch (error) {
      Logger.warn("Firebase token verification failed", {
        code: error?.code,
        message: error?.message,
      });
      throw new AuthenticationError("Invalid Firebase token");
    }

    const firebaseUid = decodedToken.uid;
    const email = decodedToken.email?.toLowerCase() || "";
    let user = await userRepository.findByFirebaseUid(firebaseUid);

    if (!user && email) {
      user = await userRepository.findByEmail(email);
      if (user) {
        user = await userRepository.update(user.id, {
          firebaseUid,
          isVerified: true,
        });
      }
    }

    if (!user) {
      const firstName =
        decodedToken.name?.split(" ").filter(Boolean)[0] ||
        (email ? email.split("@")[0] : "User");
      const lastName = decodedToken.name?.split(" ").slice(1).join(" ") || "";

      user = await userRepository.create(
        this.buildUserPayload({
          email,
          firstName,
          lastName,
          role: "client",
          isVerified: true,
          isActive: true,
          firebaseUid,
        }),
      );
    }

    if (!user.isActive) {
      throw new UserInactiveError();
    }

    await userRepository.updateLastLogin(user.id);
    const tokens = this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  /**
   * Send OTP
   */
  async sendOtp({ email, phone, role, recaptchaToken, provider }) {
    return otpService.sendOtp({ email, phone, role, recaptchaToken, provider });
  }

  /**
   * Verify OTP
   */
  async verifyOtp({ email, phone, otp, role, provider }) {
    await otpService.verifyOtp({ email, phone, otp, role, provider });

    // Check if user exists
    let user = null;
    if (email) {
      user = await userRepository.findByEmail(email);
    } else if (phone) {
      user = await userRepository.findByPhone(phone);
    }
    
    // Scenario A: User Exists (e.g. Client verifying email OR Professional login)
    if (user) {
      // Activate/verify user if needed
      if (!user.isVerified) {
        await userRepository.update(user.id, {
          isVerified: true,
          verifiedAt: new Date(),
          isActive: true,
        });
        user = await userRepository.findById(user.id);
      }

      await userRepository.updateLastLogin(user.id);
      const tokens = this.generateTokens(user);

      return {
        user: this.sanitizeUser(user),
        ...tokens,
        message: "OTP verified successfully.",
        isNewUser: false,
      };
    }

    // Scenario B: User does not exist (e.g. professional phone auth init)
    // Create new user automatically if phone verification
    if (!user && phone) {
      const userDataToSave = this.buildUserPayload({
        phone,
        role: role || "professional",
        isVerified: true,
        isActive: true,
      });
      user = await userRepository.create(userDataToSave);
      Logger.logAuth("register_phone", user.id, true, { role });

      const tokens = this.generateTokens(user);
      return {
        user: this.sanitizeUser(user),
        ...tokens,
        isNewUser: true,
        message: "Phone verified. User created.",
      };
    }

    // Scenario C: Email OTP verified but user not found
    return {
      success: false,
      message: "User not found for verification.",
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, this.refreshSecret);

      if (this.shouldUseDevAuthFallback() && decoded.userId === this.devFallbackUserId) {
        const devUser = this.buildDevUser(decoded.email);
        return this.generateTokens(devUser);
      }

      const user = await userRepository.findById(decoded.userId);

      if (!user) {
        throw new UserNotFoundError();
      }

      if (!user.isActive) {
        throw new UserInactiveError();
      }

      const tokens = this.generateTokens(user);

      return tokens;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AuthenticationError(
          "Refresh token expired",
          "AUTH_TOKEN_EXPIRED",
        );
      }
      throw new AuthenticationError(
        "Invalid refresh token",
        "AUTH_INVALID_TOKEN",
      );
    }
  }

  /**
   * Verify access token
   */
  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, this.jwtSecret);
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AuthenticationError("Token expired", "AUTH_TOKEN_EXPIRED");
      }
      throw new AuthenticationError("Invalid token", "AUTH_INVALID_TOKEN");
    }
  }

  /**
   * Generate access and refresh tokens
   */
  generateTokens(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
    });

    const refreshToken = jwt.sign({ userId: user.id }, this.refreshSecret, {
      expiresIn: this.refreshExpiresIn,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.jwtExpiresIn,
    };
  }

  /**
   * Get user from token
   */
  async getUserFromToken(userId) {
    if (this.shouldUseDevAuthFallback() && userId === this.devFallbackUserId) {
      return this.sanitizeUser(this.buildDevUser());
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError();
    }
    return this.sanitizeUser(user);
  }

  /**
   * Change password
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new UserNotFoundError();
    }

    const isValidPassword = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isValidPassword) {
      throw new AuthenticationError("Current password is incorrect");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await userRepository.update(userId, { password: hashedPassword });

    Logger.logAuth("password_change", userId, true);

    return true;
  }

  /**
   * Logout (invalidate FCM token)
   */
  async logout(userId) {
    await userRepository.update(userId, { fcmToken: null });
    Logger.logAuth("logout", userId, true);
    return true;
  }

  sanitizeUser(user) {
    const { password, fcmToken, searchTerms, firstName, lastName, ...sanitized } = user;
    return {
      ...sanitized,
      fullName: sanitized.displayName || `${firstName || ""} ${lastName || ""}`.trim(),
    };
  }

  buildUserPayload({
    email,
    phone,
    password = null,
    fullName = "",
    firstName = "",
    lastName = "",
    role = "client",
    isVerified,
    isActive = true,
    firebaseUid,
  }) {
    const normalizedEmail = email ? email.toLowerCase().trim() : undefined;
    const resolvedName = this.resolveNameParts({ fullName, firstName, lastName });
    const normalizedFirstName = resolvedName.firstName;
    const normalizedLastName = resolvedName.lastName;
    const displayName = resolvedName.fullName;

    const payload = {
      email: normalizedEmail,
      phone,
      password,
      firstName: normalizedFirstName,
      lastName: normalizedLastName,
      displayName,
      role,
      isActive,
      isVerified:
        typeof isVerified === "boolean" ? isVerified : role !== "client",
      isDeleted: false,
      settings: {
        notifications: {
          push: true,
          email: false,
          whatsapp: true,
          marketing: true,
        },
        privacy: {
          showEmail: false,
          showPhone: false,
        },
        language: "en",
        timezone: "UTC",
      },
      searchTerms: this.generateSearchTerms(
        normalizedFirstName,
        normalizedLastName,
        normalizedEmail,
      ),
    };

    const normalizedFirebaseUid =
      typeof firebaseUid === "string" ? firebaseUid.trim() : "";
    if (normalizedFirebaseUid) {
      payload.firebaseUid = normalizedFirebaseUid;
    }

    return payload;
  }

  generateSearchTerms(firstName = "", lastName = "", email = "") {
    const terms = new Set();
    const fullName = `${firstName} ${lastName}`.trim().toLowerCase();

    [firstName, lastName, fullName, email]
      .filter(Boolean)
      .forEach((value) => {
        const normalized = String(value).toLowerCase().trim();
        if (!normalized) return;
        terms.add(normalized);
        normalized
          .split(/\s+/)
          .filter(Boolean)
          .forEach((word) => terms.add(word));
      });

    return Array.from(terms);
  }

  resolveNameParts({ fullName = "", firstName = "", lastName = "" }) {
    const normalizedFullName = String(fullName || "").trim().replace(/\s+/g, " ");
    if (normalizedFullName) {
      const parts = normalizedFullName.split(" ");
      return {
        fullName: normalizedFullName,
        firstName: parts[0] || "",
        lastName: parts.slice(1).join(" "),
      };
    }

    const normalizedFirstName = String(firstName || "").trim();
    const normalizedLastName = String(lastName || "").trim();
    return {
      fullName: `${normalizedFirstName} ${normalizedLastName}`.trim(),
      firstName: normalizedFirstName,
      lastName: normalizedLastName,
    };
  }

  shouldUseDevAuthFallback() {
    return (
      process.env.NODE_ENV !== "production" &&
      (process.env.AUTH_DEV_FALLBACK || "true").toLowerCase() === "true"
    );
  }

  getDevEmail() {
    return (process.env.AUTH_DEV_EMAIL || "dev@local.test").toLowerCase();
  }

  getDevPassword() {
    return process.env.AUTH_DEV_PASSWORD || "123456";
  }

  matchesDevCredentials(email, password) {
    return (
      (email || "").toLowerCase() === this.getDevEmail() &&
      (password || "") === this.getDevPassword()
    );
  }

  buildDevUser(email = this.getDevEmail()) {
    return {
      id: this.devFallbackUserId,
      email: (email || this.getDevEmail()).toLowerCase(),
      firstName: "Dev",
      lastName: "User",
      displayName: "Dev User",
      role: "admin",
      isActive: true,
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  loginWithDevFallback(email) {
    const user = this.buildDevUser(email);
    const tokens = this.generateTokens(user);

    Logger.warn("Using dev auth fallback. Firestore is bypassed for login.", {
      email: user.email,
      userId: user.id,
    });

    return {
      user: this.sanitizeUser(user),
      ...tokens,
      fallback: "dev_auth",
    };
  }
}

export default new AuthService();
