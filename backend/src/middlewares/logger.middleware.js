/**
 * Request Logger Middleware
 * Log incoming requests and responses
 */

import Logger from "../utils/logger.util.js";

/**
 * Request logging middleware
 */
export const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Log request
  Logger.logRequest(req);

  // Capture response
  const originalSend = res.send;
  res.send = function (body) {
    const responseTime = Date.now() - startTime;

    // Log response
    Logger.logResponse(req, res, responseTime);

    return originalSend.call(this, body);
  };

  next();
};

/**
 * Skip logging for certain paths
 */
export const requestLoggerWithExclusions = (excludePaths = []) => {
  const defaultExclusions = ["/health", "/api/v1/health", "/favicon.ico"];
  const allExclusions = [...defaultExclusions, ...excludePaths];

  return (req, res, next) => {
    if (allExclusions.some((path) => req.path.startsWith(path))) {
      return next();
    }
    return requestLogger(req, res, next);
  };
};

export default {
  requestLogger,
  requestLoggerWithExclusions,
};
