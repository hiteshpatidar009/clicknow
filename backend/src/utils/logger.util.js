import winston from "winston";
import env from "../config/env.loader.js";

const { combine, timestamp, printf, colorize, errors } = winston.format;

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

const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    logFormat,
  ),
  defaultMeta: { service: "photography-booking-api" },
  transports: [
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

const isVercel = String(process.env.VERCEL || "").toLowerCase() === "true";
const isServerless =
  isVercel ||
  Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME) ||
  Boolean(process.env.FUNCTION_TARGET);

if (env.NODE_ENV === "production" && !isServerless) {
  logger.add(
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      maxsize: 5242880,
      maxFiles: 5,
    }),
  );

  logger.add(
    new winston.transports.File({
      filename: "logs/combined.log",
      maxsize: 5242880,
      maxFiles: 5,
    }),
  );
}

/**
 * Logger class for structured logging
 */
class Logger {
  static info(message, meta = {}) {
    const msg =
      typeof message === "string" ? message.replace(/\n+$/g, "") : message;
    logger.info(msg, meta);
  }

  static warn(message, meta = {}) {
    const msg =
      typeof message === "string" ? message.replace(/\n+$/g, "") : message;
    logger.warn(msg, meta);
  }

  static error(message, error = null, meta = {}) {
    if (error instanceof Error) {
      const msg =
        typeof message === "string" ? message.replace(/\n+$/g, "") : message;
      logger.error(msg, {
        ...meta,
        stack: error.stack,
        errorMessage: error.message,
      });
    } else if (error) {
      const msg =
        typeof message === "string" ? message.replace(/\n+$/g, "") : message;
      logger.error(msg, { ...meta, error });
    } else {
      const msg =
        typeof message === "string" ? message.replace(/\n+$/g, "") : message;
      logger.error(msg, meta);
    }
  }

  static debug(message, meta = {}) {
    const msg =
      typeof message === "string" ? message.replace(/\n+$/g, "") : message;
    logger.debug(msg, meta);
  }

  static http(message, meta = {}) {
    const msg =
      typeof message === "string" ? message.replace(/\n+$/g, "") : message;
    logger.http(msg, meta);
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
