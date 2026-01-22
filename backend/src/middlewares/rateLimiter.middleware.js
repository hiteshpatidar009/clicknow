import rateLimit from "express-rate-limit";
import env from "../config/env.loader.js";
import ApiResponse from "../utils/response.util.js";
import Logger from "../utils/logger.util.js";

class RateLimiterMiddleware {
  constructor() {
    this.defaultLimiter = rateLimit({
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      max: env.RATE_LIMIT_MAX_REQUESTS,
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res) => {
        Logger.warn("Rate limit exceeded", {
          ip: req.ip,
          path: req.path,
          userId: req.user?.userId,
        });
        return ApiResponse.tooManyRequests(res);
      },
    });

    this.authLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 10,
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res) => {
        Logger.warn("Auth rate limit exceeded", {
          ip: req.ip,
          path: req.path,
        });
        return ApiResponse.tooManyRequests(
          res,
          "Too many login attempts. Please try again later.",
        );
      },
    });

    this.searchLimiter = rateLimit({
      windowMs: 1 * 60 * 1000,
      max: 60,
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res) => {
        return ApiResponse.tooManyRequests(res, "Search rate limit exceeded.");
      },
    });

    this.uploadLimiter = rateLimit({
      windowMs: 60 * 60 * 1000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res) => {
        return ApiResponse.tooManyRequests(
          res,
          "Upload limit exceeded. Please try again later.",
        );
      },
    });

    this.messagingLimiter = rateLimit({
      windowMs: 1 * 60 * 1000,
      max: 30,
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res) => {
        return ApiResponse.tooManyRequests(res, "Message rate limit exceeded.");
      },
    });
  }

  createLimiter = (options) => {
    return rateLimit({
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res) => {
        return ApiResponse.tooManyRequests(
          res,
          options.message || "Rate limit exceeded.",
        );
      },
      ...options,
    });
  };
}

export default new RateLimiterMiddleware();
export const { defaultLimiter, authLimiter, searchLimiter, uploadLimiter, messagingLimiter, createLimiter } = new RateLimiterMiddleware();
