/**
 * Rate Limiting Middleware
 * Protect API from abuse
 */

import rateLimit from "express-rate-limit";
import { appConfig } from "../config/index.js";
import ApiResponse from "../utils/response.util.js";
import Logger from "../utils/logger.util.js";

/**
 * Default rate limiter
 */
export const defaultLimiter = rateLimit({
  windowMs: appConfig.rateLimit.windowMs,
  max: appConfig.rateLimit.maxRequests,
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

/**
 * Strict rate limiter for auth routes
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts
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

/**
 * Rate limiter for search/listing routes
 */
export const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return ApiResponse.tooManyRequests(res, "Search rate limit exceeded.");
  },
});

/**
 * Rate limiter for file uploads
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // 100 uploads per hour
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return ApiResponse.tooManyRequests(
      res,
      "Upload limit exceeded. Please try again later.",
    );
  },
});

/**
 * Rate limiter for messaging
 */
export const messagingLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 messages per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return ApiResponse.tooManyRequests(res, "Message rate limit exceeded.");
  },
});

/**
 * Create custom rate limiter
 */
export const createLimiter = (options) => {
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

export default {
  defaultLimiter,
  authLimiter,
  searchLimiter,
  uploadLimiter,
  messagingLimiter,
  createLimiter,
};
