import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { appConfig } from "../config/index.js";
import { firebaseDatabase } from "../database/index.js";
import { userRepository } from "../repositories/index.js";
import { UserModel } from "../models/index.js";
import Logger from "../utils/logger.util.js";
import {
  AuthenticationError,
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
  }

  /**
   * Register a new user
   */
  async register(userData) {
    const { email, phone, password, firstName, lastName, role } = userData;

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

    const userModel = UserModel.forRegistration({
      email,
      phone,
      password: hashedPassword,
      firstName,
      lastName,
      role,
    });

    const user = await userRepository.create(userModel.toJSON());

    Logger.logAuth("register", user.id, true, { role });

    const tokens = this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  /**
   * Login with email and password
   */
  async loginWithEmail(email, password) {
    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw new AuthenticationError("Invalid credentials");
    }

    if (!user.isActive) {
      throw new UserInactiveError();
    }

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

  /**
   * Login with Firebase token
   */
  async loginWithFirebase(firebaseToken) {
    try {
      const auth = firebaseDatabase.getAuth();
      const decodedToken = await auth.verifyIdToken(firebaseToken);

      let user = await userRepository.findByFirebaseUid(decodedToken.uid);

      if (!user) {
        const userModel = UserModel.forRegistration({
          firebaseUid: decodedToken.uid,
          email: decodedToken.email,
          phone: decodedToken.phone_number,
          displayName: decodedToken.name,
          avatar: decodedToken.picture,
          isVerified: decodedToken.email_verified || false,
        });

        user = await userRepository.create(userModel.toJSON());
        Logger.logAuth("firebase_register", user.id, true);
      } else {
        if (!user.isActive) {
          throw new UserInactiveError();
        }
        await userRepository.updateLastLogin(user.id);
        Logger.logAuth("firebase_login", user.id, true);
      }

      const tokens = this.generateTokens(user);

      return {
        user: this.sanitizeUser(user),
        ...tokens,
      };
    } catch (error) {
      Logger.error("Firebase login failed", error);
      throw new AuthenticationError("Firebase authentication failed");
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, this.refreshSecret);
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

  /**
   * Remove sensitive fields from user object
   */
  sanitizeUser(user) {
    const { password, fcmToken, searchTerms, ...sanitized } = user;
    return sanitized;
  }
}

export default AuthService;
