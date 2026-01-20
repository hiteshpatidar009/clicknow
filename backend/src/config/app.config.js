/**
 * Application Configuration
 * Central configuration for all app settings
 */

import dotenv from "dotenv";
dotenv.config();

class AppConfig {
  constructor() {
    this.env = process.env.NODE_ENV || "development";
    this.port = parseInt(process.env.PORT, 10) || 3000;
    this.apiVersion = process.env.API_VERSION || "v1";

    this.jwt = {
      secret: process.env.JWT_SECRET || "default-secret-change-in-production",
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
      refreshSecret: process.env.JWT_REFRESH_SECRET || "default-refresh-secret",
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
    };

    this.rateLimit = {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000,
      maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
    };

    this.logging = {
      level: process.env.LOG_LEVEL || "info",
      format: process.env.LOG_FORMAT || "combined",
    };

    this.cors = {
      origin: process.env.CORS_ORIGIN || "*",
    };

    this.pagination = {
      defaultPageSize: parseInt(process.env.DEFAULT_PAGE_SIZE, 10) || 20,
      maxPageSize: parseInt(process.env.MAX_PAGE_SIZE, 10) || 100,
    };
  }

  isDevelopment() {
    return this.env === "development";
  }

  isProduction() {
    return this.env === "production";
  }

  isTest() {
    return this.env === "test";
  }
}

export default new AppConfig();
