import authMiddleware from "./auth.middleware.js";
import errorMiddleware from "./error.middleware.js";
import validationMiddleware from "./validation.middleware.js";
import rateLimiterMiddleware from "./rateLimiter.middleware.js";
import uploadMiddleware from "./upload.middleware.js";
import loggerMiddleware from "./logger.middleware.js";

export const authenticate = authMiddleware.authenticate;
export const optionalAuth = authMiddleware.optionalAuth;
export const authorize = authMiddleware.authorize;
export const adminOnly = authMiddleware.adminOnly;
export const professionalOnly = authMiddleware.professionalOnly;
export const verifiedOnly = authMiddleware.verifiedOnly;
export const activeOnly = authMiddleware.activeOnly;

export const asyncHandler = errorMiddleware.asyncHandler;
export const notFoundHandler = errorMiddleware.notFoundHandler;
export const errorHandler = errorMiddleware.errorHandler;

export const validate = validationMiddleware.validate;
export const validateBody = validationMiddleware.validateBody;
export const validateQuery = validationMiddleware.validateQuery;
export const validateParams = validationMiddleware.validateParams;

export const defaultLimiter = rateLimiterMiddleware.defaultLimiter;
export const authLimiter = rateLimiterMiddleware.authLimiter;
export const searchLimiter = rateLimiterMiddleware.searchLimiter;
export const uploadLimiter = rateLimiterMiddleware.uploadLimiter;
export const messagingLimiter = rateLimiterMiddleware.messagingLimiter;
export const createLimiter = rateLimiterMiddleware.createLimiter;

export const uploadImage = uploadMiddleware.uploadImage;
export const uploadImages = uploadMiddleware.uploadImages;
export const uploadVideo = uploadMiddleware.uploadVideo;
export const uploadDocument = uploadMiddleware.uploadDocument;
export const uploadGeneral = uploadMiddleware.uploadGeneral;
export const uploadAvatar = uploadMiddleware.uploadAvatar;
export const uploadPortfolio = uploadMiddleware.uploadPortfolio;
export const handleMulterError = uploadMiddleware.handleMulterError;

export const requestLogger = loggerMiddleware.requestLogger;
export const requestLoggerWithExclusions = loggerMiddleware.requestLoggerWithExclusions;
