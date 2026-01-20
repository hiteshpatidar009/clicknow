/**
 * Middlewares Index
 * Central export for all middlewares
 */

export {
  authenticate,
  optionalAuth,
  authorize,
  adminOnly,
  professionalOnly,
  verifiedOnly,
  activeOnly,
} from "./auth.middleware.js";

export {
  asyncHandler,
  notFoundHandler,
  errorHandler,
} from "./error.middleware.js";

export {
  validate,
  validateBody,
  validateQuery,
  validateParams,
} from "./validation.middleware.js";

export {
  defaultLimiter,
  authLimiter,
  searchLimiter,
  uploadLimiter,
  messagingLimiter,
  createLimiter,
} from "./rateLimiter.middleware.js";

export {
  uploadImage,
  uploadImages,
  uploadVideo,
  uploadDocument,
  uploadGeneral,
  uploadAvatar,
  uploadPortfolio,
  handleMulterError,
} from "./upload.middleware.js";

export {
  requestLogger,
  requestLoggerWithExclusions,
} from "./logger.middleware.js";
