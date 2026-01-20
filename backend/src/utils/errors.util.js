/**
 * Custom Error Classes
 * Application-specific error handling
 */

import { HTTP_STATUS, ERROR_CODES } from "./constants.util.js";

/**
 * Base Application Error
 */
class AppError extends Error {
  constructor(
    message,
    statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    errorCode = null,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode || "INTERNAL_ERROR";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation Error
 */
class ValidationError extends AppError {
  constructor(message = "Validation failed", errors = null) {
    super(message, HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR);
    this.errors = errors;
  }
}

/**
 * Authentication Error
 */
class AuthenticationError extends AppError {
  constructor(
    message = "Authentication failed",
    errorCode = ERROR_CODES.AUTH_UNAUTHORIZED,
  ) {
    super(message, HTTP_STATUS.UNAUTHORIZED, errorCode);
  }
}

/**
 * Authorization Error
 */
class AuthorizationError extends AppError {
  constructor(message = "Access denied") {
    super(message, HTTP_STATUS.FORBIDDEN, ERROR_CODES.AUTH_FORBIDDEN);
  }
}

/**
 * Not Found Error
 */
class NotFoundError extends AppError {
  constructor(resource = "Resource", errorCode = null) {
    super(
      `${resource} not found`,
      HTTP_STATUS.NOT_FOUND,
      errorCode || "NOT_FOUND",
    );
  }
}

/**
 * Conflict Error
 */
class ConflictError extends AppError {
  constructor(message = "Resource already exists", errorCode = null) {
    super(message, HTTP_STATUS.CONFLICT, errorCode || "CONFLICT");
  }
}

/**
 * Rate Limit Error
 */
class RateLimitError extends AppError {
  constructor(message = "Too many requests") {
    super(
      message,
      HTTP_STATUS.TOO_MANY_REQUESTS,
      ERROR_CODES.RATE_LIMIT_EXCEEDED,
    );
  }
}

/**
 * Service Unavailable Error
 */
class ServiceUnavailableError extends AppError {
  constructor(message = "Service temporarily unavailable") {
    super(
      message,
      HTTP_STATUS.SERVICE_UNAVAILABLE,
      ERROR_CODES.SERVICE_UNAVAILABLE,
    );
  }
}

/**
 * User-specific errors
 */
class UserNotFoundError extends NotFoundError {
  constructor() {
    super("User", ERROR_CODES.USER_NOT_FOUND);
  }
}

class UserAlreadyExistsError extends ConflictError {
  constructor() {
    super(
      "User with this email already exists",
      ERROR_CODES.USER_ALREADY_EXISTS,
    );
  }
}

class UserInactiveError extends AppError {
  constructor() {
    super(
      "User account is inactive",
      HTTP_STATUS.FORBIDDEN,
      ERROR_CODES.USER_INACTIVE,
    );
  }
}

/**
 * Professional-specific errors
 */
class ProfessionalNotFoundError extends NotFoundError {
  constructor() {
    super("Professional profile", ERROR_CODES.PROFESSIONAL_NOT_FOUND);
  }
}

class ProfessionalNotApprovedError extends AppError {
  constructor() {
    super(
      "Professional profile is not approved",
      HTTP_STATUS.FORBIDDEN,
      ERROR_CODES.PROFESSIONAL_NOT_APPROVED,
    );
  }
}

class ProfessionalPendingApprovalError extends AppError {
  constructor() {
    super(
      "Professional profile is pending approval",
      HTTP_STATUS.FORBIDDEN,
      ERROR_CODES.PROFESSIONAL_PENDING_APPROVAL,
    );
  }
}

/**
 * Booking-specific errors
 */
class BookingNotFoundError extends NotFoundError {
  constructor() {
    super("Booking", ERROR_CODES.BOOKING_NOT_FOUND);
  }
}

class BookingSlotUnavailableError extends AppError {
  constructor() {
    super(
      "The selected time slot is not available",
      HTTP_STATUS.CONFLICT,
      ERROR_CODES.BOOKING_SLOT_UNAVAILABLE,
    );
  }
}

class BookingCannotCancelError extends AppError {
  constructor() {
    super(
      "This booking cannot be cancelled",
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODES.BOOKING_CANNOT_CANCEL,
    );
  }
}

class BookingCannotRescheduleError extends AppError {
  constructor() {
    super(
      "This booking cannot be rescheduled",
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODES.BOOKING_CANNOT_RESCHEDULE,
    );
  }
}

/**
 * Review-specific errors
 */
class ReviewNotFoundError extends NotFoundError {
  constructor() {
    super("Review", ERROR_CODES.REVIEW_NOT_FOUND);
  }
}

class ReviewAlreadyExistsError extends ConflictError {
  constructor() {
    super(
      "You have already reviewed this booking",
      ERROR_CODES.REVIEW_ALREADY_EXISTS,
    );
  }
}

class ReviewNotAllowedError extends AppError {
  constructor() {
    super(
      "You can only review completed bookings",
      HTTP_STATUS.FORBIDDEN,
      ERROR_CODES.REVIEW_NOT_ALLOWED,
    );
  }
}

/**
 * Enquiry-specific errors
 */
class EnquiryNotFoundError extends NotFoundError {
  constructor() {
    super("Enquiry", ERROR_CODES.ENQUIRY_NOT_FOUND);
  }
}

class EnquiryAlreadyExistsError extends ConflictError {
  constructor() {
    super(
      "You already have a pending enquiry for this professional",
      ERROR_CODES.ENQUIRY_ALREADY_EXISTS,
    );
  }
}

/**
 * File-specific errors
 */
class FileTooLargeError extends AppError {
  constructor(maxSize) {
    super(
      `File size exceeds the maximum limit of ${maxSize}MB`,
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODES.FILE_TOO_LARGE,
    );
  }
}

class FileInvalidTypeError extends AppError {
  constructor(allowedTypes) {
    super(
      `Invalid file type. Allowed types: ${allowedTypes.join(", ")}`,
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODES.FILE_INVALID_TYPE,
    );
  }
}

class FileUploadError extends AppError {
  constructor(message = "File upload failed") {
    super(
      message,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_CODES.FILE_UPLOAD_FAILED,
    );
  }
}

export {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  ServiceUnavailableError,
  UserNotFoundError,
  UserAlreadyExistsError,
  UserInactiveError,
  ProfessionalNotFoundError,
  ProfessionalNotApprovedError,
  ProfessionalPendingApprovalError,
  BookingNotFoundError,
  BookingSlotUnavailableError,
  BookingCannotCancelError,
  BookingCannotRescheduleError,
  ReviewNotFoundError,
  ReviewAlreadyExistsError,
  ReviewNotAllowedError,
  EnquiryNotFoundError,
  EnquiryAlreadyExistsError,
  FileTooLargeError,
  FileInvalidTypeError,
  FileUploadError,
};
