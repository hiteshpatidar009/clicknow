/**
 * Error Handling Middleware
 * Global error handler and async wrapper
 */

import Logger from "../utils/logger.util.js";
import ApiResponse from "../utils/response.util.js";
import {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
} from "../utils/errors.util.js";

/**
 * Async handler wrapper
 * Catches async errors and passes to error handler
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Not found handler for undefined routes
 */
export const notFoundHandler = (req, res, next) => {
  return ApiResponse.notFound(res, `Route ${req.originalUrl} not found`);
};

/**
 * Global error handler
 */
export const errorHandler = (err, req, res, next) => {
  // Log error
  Logger.error("Unhandled error", err, {
    url: req.originalUrl,
    method: req.method,
    userId: req.user?.userId,
  });

  // Handle known errors
  if (err instanceof ValidationError) {
    return ApiResponse.validationError(res, err.errors, err.message);
  }

  if (err instanceof AuthenticationError) {
    return ApiResponse.unauthorized(res, err.message, err.errorCode);
  }

  if (err instanceof AuthorizationError) {
    return ApiResponse.forbidden(res, err.message);
  }

  if (err instanceof NotFoundError) {
    return ApiResponse.notFound(res, err.message);
  }

  if (err instanceof AppError) {
    return ApiResponse.error(res, err.statusCode, err.message, err.errorCode);
  }

  // Handle Joi validation errors
  if (err.isJoi) {
    const errors = err.details.map((detail) => ({
      field: detail.path.join("."),
      message: detail.message,
    }));
    return ApiResponse.validationError(res, errors, "Validation failed");
  }

  // Handle Firebase errors
  if (err.code && err.code.startsWith("auth/")) {
    return ApiResponse.unauthorized(res, getFirebaseAuthMessage(err.code));
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    return ApiResponse.unauthorized(res, "Invalid token");
  }

  if (err.name === "TokenExpiredError") {
    return ApiResponse.unauthorized(res, "Token expired", "AUTH_TOKEN_EXPIRED");
  }

  // Handle Multer errors
  if (err.code === "LIMIT_FILE_SIZE") {
    return ApiResponse.badRequest(res, "File too large");
  }

  if (err.code === "LIMIT_FILE_COUNT") {
    return ApiResponse.badRequest(res, "Too many files");
  }

  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    return ApiResponse.badRequest(res, "Unexpected file field");
  }

  // Default server error
  const statusCode = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === "production" ?
      "Internal server error"
    : err.message;

  return ApiResponse.serverError(res, message);
};

/**
 * Get user-friendly Firebase auth error message
 */
function getFirebaseAuthMessage(code) {
  const messages = {
    "auth/user-not-found": "User not found",
    "auth/wrong-password": "Invalid password",
    "auth/email-already-in-use": "Email already registered",
    "auth/invalid-email": "Invalid email address",
    "auth/weak-password": "Password is too weak",
    "auth/operation-not-allowed": "Operation not allowed",
    "auth/account-exists-with-different-credential":
      "Account exists with different credentials",
    "auth/invalid-credential": "Invalid credentials",
    "auth/invalid-verification-code": "Invalid verification code",
    "auth/invalid-verification-id": "Invalid verification ID",
    "auth/requires-recent-login": "Please re-authenticate",
    "auth/too-many-requests": "Too many requests. Try again later",
  };

  return messages[code] || "Authentication failed";
}

export default {
  asyncHandler,
  notFoundHandler,
  errorHandler,
};
