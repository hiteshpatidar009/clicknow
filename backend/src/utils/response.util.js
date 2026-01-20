/**
 * API Response Utility
 * Standardized API response formatting
 */

import { HTTP_STATUS } from "./constants.util.js";

class ApiResponse {
  /**
   * Success response
   * @param {Object} res - Express response object
   * @param {any} data - Response data
   * @param {string} message - Success message
   * @param {number} statusCode - HTTP status code
   */
  static success(
    res,
    data = null,
    message = "Success",
    statusCode = HTTP_STATUS.OK,
  ) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Created response
   * @param {Object} res - Express response object
   * @param {any} data - Created resource data
   * @param {string} message - Success message
   */
  static created(res, data = null, message = "Resource created successfully") {
    return this.success(res, data, message, HTTP_STATUS.CREATED);
  }

  /**
   * No content response
   * @param {Object} res - Express response object
   */
  static noContent(res) {
    return res.status(HTTP_STATUS.NO_CONTENT).send();
  }

  /**
   * Paginated response
   * @param {Object} res - Express response object
   * @param {Array} data - Array of items
   * @param {Object} pagination - Pagination info
   * @param {string} message - Success message
   */
  static paginated(res, data, pagination, message = "Success") {
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message,
      data,
      pagination: {
        page: pagination.page,
        pageSize: pagination.pageSize,
        totalCount: pagination.totalCount,
        totalPages: pagination.totalPages,
        hasMore: pagination.hasMore,
        nextCursor: pagination.nextCursor,
      },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Error response
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {string} errorCode - Application error code
   * @param {any} errors - Additional error details
   */
  static error(
    res,
    message = "An error occurred",
    statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    errorCode = null,
    errors = null,
  ) {
    const response = {
      success: false,
      message,
      errorCode,
      timestamp: new Date().toISOString(),
    };

    if (errors) {
      response.errors = errors;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Bad request response
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   * @param {any} errors - Validation errors
   */
  static badRequest(res, message = "Bad request", errors = null) {
    return this.error(
      res,
      message,
      HTTP_STATUS.BAD_REQUEST,
      "VALIDATION_ERROR",
      errors,
    );
  }

  /**
   * Unauthorized response
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   */
  static unauthorized(res, message = "Unauthorized") {
    return this.error(
      res,
      message,
      HTTP_STATUS.UNAUTHORIZED,
      "AUTH_UNAUTHORIZED",
    );
  }

  /**
   * Forbidden response
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   */
  static forbidden(res, message = "Forbidden") {
    return this.error(res, message, HTTP_STATUS.FORBIDDEN, "AUTH_FORBIDDEN");
  }

  /**
   * Not found response
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   * @param {string} errorCode - Error code
   */
  static notFound(
    res,
    message = "Resource not found",
    errorCode = "NOT_FOUND",
  ) {
    return this.error(res, message, HTTP_STATUS.NOT_FOUND, errorCode);
  }

  /**
   * Conflict response
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   * @param {string} errorCode - Error code
   */
  static conflict(
    res,
    message = "Resource already exists",
    errorCode = "CONFLICT",
  ) {
    return this.error(res, message, HTTP_STATUS.CONFLICT, errorCode);
  }

  /**
   * Unprocessable entity response
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   * @param {any} errors - Validation errors
   */
  static unprocessable(res, message = "Unprocessable entity", errors = null) {
    return this.error(
      res,
      message,
      HTTP_STATUS.UNPROCESSABLE_ENTITY,
      "VALIDATION_ERROR",
      errors,
    );
  }

  /**
   * Too many requests response
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   */
  static tooManyRequests(res, message = "Too many requests") {
    return this.error(
      res,
      message,
      HTTP_STATUS.TOO_MANY_REQUESTS,
      "RATE_LIMIT_EXCEEDED",
    );
  }

  /**
   * Internal server error response
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   */
  static internalError(res, message = "Internal server error") {
    return this.error(
      res,
      message,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      "INTERNAL_ERROR",
    );
  }

  /**
   * Service unavailable response
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   */
  static serviceUnavailable(res, message = "Service temporarily unavailable") {
    return this.error(
      res,
      message,
      HTTP_STATUS.SERVICE_UNAVAILABLE,
      "SERVICE_UNAVAILABLE",
    );
  }
}

export default ApiResponse;
