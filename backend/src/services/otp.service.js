import axios from "axios";
import env from "../config/env.loader.js";
import Logger from "../utils/logger.util.js";
import {
  ServiceUnavailableError,
  ValidationError,
  AuthenticationError,
} from "../utils/errors.util.js";

function parseBoolean(value) {
  const normalized = String(value ?? "")
    .toLowerCase()
    .trim();
  if (!normalized) {
    return null;
  }
  return ["1", "true", "yes", "y", "on"].includes(normalized);
}

function parseNumber(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function maskEmail(email) {
  const normalized = String(email || "").trim();
  const [localPart = "", domainPart = ""] = normalized.split("@");
  if (!localPart || !domainPart) {
    return normalized;
  }
  const visiblePrefix = localPart.slice(0, 2);
  return `${visiblePrefix}***@${domainPart}`;
}

class OtpService {
  constructor() {
    this.store = new Map();
    this.otpLength = 6;
    this.defaultExpiryMs = Math.max(env.OTP_EXPIRY_MINUTES || 10, 1) * 60 * 1000;
    this.emailProvider = env.OTP_PROVIDER_EMAIL || "mock";
    this.phoneProvider = env.OTP_PROVIDER_PHONE || "mock";
    this.allowMockFallback = String(env.OTP_ALLOW_MOCK_FALLBACK) === "true";
    this.smtpTransporter = null;
  }

  buildKey({ channel, identifier, role = "client" }) {
    return `${channel}:${String(identifier || "").toLowerCase().trim()}:${role}`;
  }

  cleanupExpired() {
    const now = Date.now();
    for (const [key, value] of this.store.entries()) {
      if (!value?.expiresAt || value.expiresAt < now) {
        this.store.delete(key);
      }
    }
  }

  generateOtp() {
    const min = 10 ** (this.otpLength - 1);
    const max = 10 ** this.otpLength - 1;
    return String(Math.floor(Math.random() * (max - min + 1)) + min);
  }

  getExpirySeconds() {
    return Math.floor(this.defaultExpiryMs / 1000);
  }

  resolveProvider({ channel, requestedProvider }) {
    const provider = String(requestedProvider || "")
      .toLowerCase()
      .trim();
    if (!provider) {
      return channel === "email" ? this.emailProvider : this.phoneProvider;
    }

    const allowedByChannel = {
      email: new Set(["smtp", "mock"]),
      phone: new Set(["firebase", "mock"]),
    };
    if (!allowedByChannel[channel]?.has(provider)) {
      throw new ValidationError(
        `Unsupported provider '${provider}' for ${channel} OTP`,
      );
    }
    return provider;
  }

  async sendOtp({ email, phone, role = "client", recaptchaToken, provider }) {
    this.cleanupExpired();

    if (email) {
      return this.sendEmailOtp({
        email,
        role,
        provider: this.resolveProvider({ channel: "email", requestedProvider: provider }),
      });
    }

    if (phone) {
      return this.sendPhoneOtp({
        phone,
        role,
        recaptchaToken,
        provider: this.resolveProvider({ channel: "phone", requestedProvider: provider }),
      });
    }

    throw new ValidationError("Either email or phone is required");
  }

  async verifyOtp({ email, phone, otp, role = "client", provider }) {
    this.cleanupExpired();

    if (email) {
      return this.verifyStoredOtp({
        channel: "email",
        identifier: email,
        otp,
        role,
      });
    }

    if (phone) {
      const key = this.buildKey({ channel: "phone", identifier: phone, role });
      const record = this.store.get(key);

      if (!record || record.expiresAt < Date.now()) {
        throw new AuthenticationError("OTP expired or not found");
      }

      const requestedProvider = this.resolveProvider({
        channel: "phone",
        requestedProvider: provider,
      });
      if (provider && record.provider !== requestedProvider) {
        throw new AuthenticationError(
          `OTP provider mismatch. Expected ${record.provider}.`,
        );
      }

      if (record.provider === "firebase") {
        await this.verifyFirebasePhoneOtp(record.sessionInfo, otp);
      } else {
        if (record.otp !== otp) {
          throw new AuthenticationError("Invalid OTP");
        }
      }

      this.store.delete(key);
      return { verified: true, channel: "phone", provider: record.provider };
    }

    throw new ValidationError("Either email or phone is required");
  }

  async sendEmailOtp({ email, role, provider }) {
    const normalizedEmail = String(email || "").toLowerCase().trim();
    const otp = this.generateOtp();
    const key = this.buildKey({
      channel: "email",
      identifier: normalizedEmail,
      role,
    });
    const expiresAt = Date.now() + this.defaultExpiryMs;

    this.store.set(key, {
      provider,
      otp,
      expiresAt,
    });

    if (provider === "smtp") {
      await this.sendOtpBySmtp(normalizedEmail, otp);
      return {
        message: "OTP sent successfully",
        channel: "email",
        provider: "smtp",
        expiresIn: this.getExpirySeconds(),
      };
    }

    Logger.info(
      `[MOCK] Sending OTP ${otp} to email: ${normalizedEmail} for role: ${role}`,
    );
    return {
      message: "OTP sent successfully",
      channel: "email",
      provider: "mock",
      expiresIn: this.getExpirySeconds(),
      devOtp: otp,
    };
  }

  async sendPhoneOtp({ phone, role, recaptchaToken, provider }) {
    const normalizedPhone = String(phone || "").trim();
    const key = this.buildKey({
      channel: "phone",
      identifier: normalizedPhone,
      role,
    });
    const expiresAt = Date.now() + this.defaultExpiryMs;

    if (provider === "firebase") {
      try {
        const sessionInfo = await this.sendFirebasePhoneOtp(
          normalizedPhone,
          recaptchaToken,
        );
        this.store.set(key, {
          provider: "firebase",
          sessionInfo,
          expiresAt,
        });
        return {
          message: "OTP sent successfully",
          channel: "phone",
          provider: "firebase",
          expiresIn: this.getExpirySeconds(),
        };
      } catch (error) {
        Logger.error("Firebase phone OTP send failed", {
          message: error?.message,
        });
        if (!this.allowMockFallback) {
          throw error;
        }
      }
    }

    const otp = this.generateOtp();
    this.store.set(key, {
      provider: "mock",
      otp,
      expiresAt,
    });
    Logger.info(`[MOCK] Sending OTP ${otp} to phone: ${normalizedPhone} for role: ${role}`);
    return {
      message: "OTP sent successfully",
      channel: "phone",
      provider: "mock",
      expiresIn: this.getExpirySeconds(),
      devOtp: otp,
    };
  }

  async verifyStoredOtp({ channel, identifier, otp, role }) {
    const key = this.buildKey({ channel, identifier, role });
    const record = this.store.get(key);

    if (!record || record.expiresAt < Date.now()) {
      throw new AuthenticationError("OTP expired or not found");
    }

    if (record.otp !== otp) {
      throw new AuthenticationError("Invalid OTP");
    }

    this.store.delete(key);
    return { verified: true, channel, provider: record.provider };
  }

  async getSmtpTransporter() {
    if (this.smtpTransporter) {
      return this.smtpTransporter;
    }

    const host = env.SMTP_HOST;
    const user = env.SMTP_USER;
    const pass = env.SMTP_PASS;
    const from = env.SMTP_FROM;

    if (!host || !user || !pass || !from) {
      throw new ServiceUnavailableError(
        "SMTP is not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_FROM.",
      );
    }

    let nodemailerModule;
    try {
      nodemailerModule = await import("nodemailer");
    } catch (error) {
      throw new ServiceUnavailableError(
        "nodemailer package is required for SMTP email OTP",
      );
    }
    const nodemailer = nodemailerModule.default || nodemailerModule;

    const port = parseNumber(env.SMTP_PORT, 587);
    const explicitSecure = parseBoolean(env.SMTP_SECURE);
    const secure = explicitSecure === null ? port === 465 : explicitSecure;

    const transportConfig = {
      host,
      port,
      secure,
      auth: { user, pass },
      pool: true,
      maxConnections: 2,
      maxMessages: 100,
      connectionTimeout: parseNumber(process.env.SMTP_CONNECTION_TIMEOUT, 15000),
      greetingTimeout: parseNumber(process.env.SMTP_GREETING_TIMEOUT, 10000),
      socketTimeout: parseNumber(process.env.SMTP_SOCKET_TIMEOUT, 20000),
      requireTLS: !secure,
      tls: {
        minVersion: "TLSv1.2",
        servername: host,
      },
    };

    Logger.info("Initializing SMTP transporter", {
      provider: "smtp",
      host,
      port,
      secure,
      requireTLS: transportConfig.requireTLS,
      hasAuthUser: Boolean(user),
      hasAuthPass: Boolean(pass),
      fromConfigured: Boolean(from),
      nodeEnv: env.NODE_ENV,
    });

    this.smtpTransporter = nodemailer.createTransport({
      ...transportConfig,
    });

    try {
      await this.smtpTransporter.verify();
      Logger.info("SMTP transporter verified successfully", {
        host,
        port,
        secure,
      });
    } catch (error) {
      Logger.error(
        "SMTP transporter verification failed",
        error,
        {
          host,
          port,
          secure,
          code: error?.code,
          command: error?.command,
          responseCode: error?.responseCode,
          response: error?.response,
        },
      );
      this.smtpTransporter = null;
      throw new ServiceUnavailableError(
        "SMTP connection failed. Check SMTP credentials, sender, and TLS settings.",
      );
    }

    return this.smtpTransporter;
  }

  async sendOtpBySmtp(email, otp) {
    const transporter = await this.getSmtpTransporter();
    const from = env.SMTP_FROM;
    const subject = "Your ClickNow verification code";
    const text = `Your OTP is ${otp}. It will expire in ${env.OTP_EXPIRY_MINUTES || 10} minutes.`;
    const html = `<p>Your OTP is <b>${otp}</b>.</p><p>It expires in ${env.OTP_EXPIRY_MINUTES || 10} minutes.</p>`;

    try {
      const info = await transporter.sendMail({
        from,
        to: email,
        subject,
        text,
        html,
      });

      Logger.info("SMTP OTP email sent", {
        to: maskEmail(email),
        messageId: info?.messageId,
        accepted: info?.accepted,
        rejected: info?.rejected,
        response: info?.response,
      });
    } catch (error) {
      Logger.error("SMTP sendMail failed", error, {
        to: maskEmail(email),
        code: error?.code,
        command: error?.command,
        responseCode: error?.responseCode,
        response: error?.response,
      });
      throw new ServiceUnavailableError(
        "OTP email delivery failed. Check SMTP sender/domain verification and credentials.",
      );
    }
  }

  async sendFirebasePhoneOtp(phoneNumber, recaptchaToken) {
    if (!env.FIREBASE_WEB_API_KEY) {
      throw new ServiceUnavailableError(
        "FIREBASE_WEB_API_KEY is required for Firebase phone OTP",
      );
    }

    if (!recaptchaToken) {
      throw new ValidationError(
        "recaptchaToken is required when OTP_PROVIDER_PHONE is firebase",
      );
    }

    const url = `https://identitytoolkit.googleapis.com/v1/accounts:sendVerificationCode?key=${env.FIREBASE_WEB_API_KEY}`;
    const { data } = await axios.post(
      url,
      {
        phoneNumber,
        recaptchaToken,
      },
      {
        timeout: 10000,
      },
    );

    if (!data?.sessionInfo) {
      throw new ServiceUnavailableError("Failed to create Firebase OTP session");
    }

    return data.sessionInfo;
  }

  async verifyFirebasePhoneOtp(sessionInfo, code) {
    if (!env.FIREBASE_WEB_API_KEY) {
      throw new ServiceUnavailableError(
        "FIREBASE_WEB_API_KEY is required for Firebase phone OTP verification",
      );
    }

    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPhoneNumber?key=${env.FIREBASE_WEB_API_KEY}`;
    try {
      await axios.post(
        url,
        {
          sessionInfo,
          code,
        },
        {
          timeout: 10000,
        },
      );
    } catch (error) {
      const firebaseMessage =
        error?.response?.data?.error?.message || "Invalid OTP";
      throw new AuthenticationError(firebaseMessage);
    }
  }
}

export default new OtpService();
