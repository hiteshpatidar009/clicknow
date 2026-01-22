import dotenv from "dotenv";
import env from "./env.loader.js";

class AppConfig {
  constructor() {
    this.env = env.NODE_ENV;
    this.port = env.PORT;
    this.apiVersion = env.API_VERSION;

    this.jwt = {
      secret: env.JWT_SECRET,
      expiresIn: env.JWT_EXPIRES_IN,
      refreshSecret: env.JWT_REFRESH_SECRET,
      refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
    };

    this.rateLimit = {
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
    };

    this.logging = {
      level: env.LOG_LEVEL,
      format: env.LOG_FORMAT,
    };

    this.cors = {
      origin: env.CORS_ORIGIN,
    };

    this.pagination = {
      defaultPageSize: env.DEFAULT_PAGE_SIZE,
      maxPageSize: env.MAX_PAGE_SIZE,
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

export default AppConfig;
