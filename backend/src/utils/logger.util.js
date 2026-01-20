/**
 * Logger Utility
 * Winston-based logging with multiple transports
 */

import winston from "winston";
import { appConfig } from "../config/index.js";

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom log format
const logFormat = printf(
  ({ level, message, timestamp, stack, ...metadata }) => {
    let log = `${timestamp} [${level}]: ${message}`;

    if (Object.keys(metadata).length > 0) {
      log += ` ${JSON.stringify(metadata)}`;
    }

    if (stack) {
      log += `\n${stack}`;
    }

    return log;
  },
);

// Create logger instance
const logger = winston.createLogger({
  level: appConfig.logging.level,
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    logFormat,
  ),
  defaultMeta: { service: "photography-booking-api" },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        logFormat,
      ),
    }),
  ],
  exitOnError: false,
});

// Add file transports in production
if (appConfig.isProduction()) {
  // Error log file
  logger.add(
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  );

  // Combined log file
  logger.add(
    new winston.transports.File({
      filename: "logs/combined.log",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  );
}

/**
 * Logger class for structured logging
 */
class Logger {
  static info(message, meta = {}) {
    logger.info(message, meta);
  }

  static warn(message, meta = {}) {
    logger.warn(message, meta);
  }

  static error(message, error = null, meta = {}) {
    if (error instanceof Error) {
      logger.error(message, {
        ...meta,
        stack: error.stack,
        errorMessage: error.message,
      });
    } else if (error) {
      logger.error(message, { ...meta, error });
    } else {
      logger.error(message, meta);
    }
  }

  static debug(message, meta = {}) {
    logger.debug(message, meta);
  }

  static http(message, meta = {}) {
    logger.http(message, meta);
  }

  /**
   * Log API request
   */
  static logRequest(req) {
    const { method, originalUrl, ip, headers } = req;
    logger.http("API Request", {
      method,
      url: originalUrl,
      ip,
      userAgent: headers["user-agent"],
    });
  }

  /**
   * Log API response
   */
  static logResponse(req, res, responseTime) {
    const { method, originalUrl } = req;
    const { statusCode } = res;

    const level = statusCode >= 400 ? "warn" : "http";
    logger[level]("API Response", {
      method,
      url: originalUrl,
      statusCode,
      responseTime: `${responseTime}ms`,
    });
  }

  /**
   * Log database operation
   */
  static logDbOperation(operation, collection, duration = null) {
    logger.debug("DB Operation", {
      operation,
      collection,
      duration: duration ? `${duration}ms` : undefined,
    });
  }

  /**
   * Log external service call
   */
  static logExternalCall(service, operation, success, duration = null) {
    const level = success ? "debug" : "warn";
    logger[level]("External Service Call", {
      service,
      operation,
      success,
      duration: duration ? `${duration}ms` : undefined,
    });
  }

  /**
   * Log authentication event
   */
  static logAuth(event, userId, success, meta = {}) {
    const level = success ? "info" : "warn";
    logger[level]("Auth Event", {
      event,
      userId,
      success,
      ...meta,
    });
  }

  /**
   * Log business event
   */
  static logBusinessEvent(event, data = {}) {
    logger.info("Business Event", {
      event,
      ...data,
    });
  }
}

export default Logger;
export { logger };
