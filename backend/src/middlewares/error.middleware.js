import Logger from "../utils/logger.util.js";
import ApiResponse from "../utils/response.util.js";
import {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
} from "../utils/errors.util.js";

class ErrorMiddleware {
  /**
   * Async handler wrapper
   * Catches async errors and passes to error handler
   */
  asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
  };

  /**
   * Not found handler for undefined routes
   */
  notFoundHandler = (req, res, next) => {
  return ApiResponse.notFound(res, `Route ${req.originalUrl} not found`);
  };

  /**
   * Global error handler
   */
  errorHandler = (err, req, res, next) => {
  const logMeta = {
    url: req.originalUrl,
    method: req.method,
    userId: req.user?.userId,
  };

  if (isFirestoreQuotaError(err) || err?.statusCode === 503) {
    Logger.warn("Service unavailable error", {
      ...logMeta,
      errorMessage: err?.message,
      code: err?.code,
    });
  } else {
    Logger.error("Unhandled error", err, logMeta);
  }

  // Handle Firestore/gRPC connection errors immediately
  if (err.code === 5 || err.code === "NOT_FOUND") {
    return ApiResponse.serverError(res, "Database connection failed. Please check Firebase configuration.");
  }
  
  // Handle Firestore quota/rate limit failures explicitly
  if (isFirestoreQuotaError(err)) {
    return ApiResponse.serviceUnavailable(
      res,
      "Database quota exceeded. Please try again later.",
    );
  }

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
    return ApiResponse.error(res, err.message, err.statusCode, err.errorCode);
  }

  if (err.isJoi) {
    const errors = err.details.map((detail) => ({
      field: detail.path.join("."),
      message: detail.message,
    }));
    return ApiResponse.validationError(res, errors, "Validation failed");
  }

  if (err.code && typeof err.code === 'string' && err.code.startsWith("auth/")) {
    return ApiResponse.unauthorized(res, getFirebaseAuthMessage(err.code));
  }

  if (err.name === "JsonWebTokenError") {
    return ApiResponse.unauthorized(res, "Invalid token");
  }

  if (err.name === "TokenExpiredError") {
    return ApiResponse.unauthorized(res, "Token expired", "AUTH_TOKEN_EXPIRED");
  }

  if (err.code === "LIMIT_FILE_SIZE") {
    return ApiResponse.badRequest(res, "File too large");
  }

  if (err.code === "LIMIT_FILE_COUNT") {
    return ApiResponse.badRequest(res, "Too many files");
  }

  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    return ApiResponse.badRequest(res, "Unexpected file field");
  }

  if (err?.code === 11000) {
    const duplicatedField = Object.keys(err?.keyPattern || {})[0];
    const message = duplicatedField
      ? `${duplicatedField} already exists`
      : "Duplicate value violates unique constraint";
    return ApiResponse.conflict(res, message, "DUPLICATE_KEY");
  }


  const statusCode = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === "production" ?
      "Internal server error"
    : err.message;

  if (statusCode === 503) {
    return ApiResponse.serviceUnavailable(res, message);
  }

  return ApiResponse.error(res, message, statusCode, err.errorCode || "INTERNAL_ERROR");
  };
}

function isFirestoreQuotaError(err) {
  const code = err?.code;
  const message = (err?.message || "").toLowerCase();

  return (
    code === 8 ||
    code === "8" ||
    code === "RESOURCE_EXHAUSTED" ||
    message.includes("resource_exhausted") ||
    message.includes("quota exceeded")
  );
}

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

export default new ErrorMiddleware();
export const { asyncHandler, notFoundHandler, errorHandler } = new ErrorMiddleware();
