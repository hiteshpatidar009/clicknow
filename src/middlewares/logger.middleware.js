import Logger from "../utils/logger.util.js";

class LoggerMiddleware {
  requestLogger = (req, res, next) => {
    const startTime = Date.now();

    Logger.logRequest(req);

    const originalSend = res.send;
    res.send = function (body) {
      const responseTime = Date.now() - startTime;

      Logger.logResponse(req, res, responseTime);

      return originalSend.call(this, body);
    };

    next();
  };

  requestLoggerWithExclusions = (excludePaths = []) => {
    const defaultExclusions = ["/health", "/api/v1/health", "/favicon.ico"];
    const allExclusions = [...defaultExclusions, ...excludePaths];

    return (req, res, next) => {
      if (allExclusions.some((path) => req.path.startsWith(path))) {
        return next();
      }
      return this.requestLogger(req, res, next);
    };
  };
}

export default new LoggerMiddleware();
