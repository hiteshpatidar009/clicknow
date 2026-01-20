/**
 * Upload Middleware
 * Multer configuration for file uploads
 */

import multer from "multer";
import { awsConfig } from "../config/index.js";
import ApiResponse from "../utils/response.util.js";

/**
 * Memory storage (for S3 upload)
 */
const storage = multer.memoryStorage();

/**
 * File filter function
 */
const fileFilter = (allowedTypes) => {
  return (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Invalid file type. Allowed types: ${allowedTypes.join(", ")}`,
        ),
        false,
      );
    }
  };
};

/**
 * Image upload configuration
 */
export const uploadImage = multer({
  storage,
  limits: {
    fileSize: awsConfig.getMaxFileSize(),
    files: 1,
  },
  fileFilter: fileFilter([
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ]),
});

/**
 * Multiple images upload
 */
export const uploadImages = multer({
  storage,
  limits: {
    fileSize: awsConfig.getMaxFileSize(),
    files: 10,
  },
  fileFilter: fileFilter([
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ]),
});

/**
 * Video upload configuration
 */
export const uploadVideo = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
    files: 1,
  },
  fileFilter: fileFilter(["video/mp4", "video/webm", "video/quicktime"]),
});

/**
 * Document upload configuration
 */
export const uploadDocument = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5,
  },
  fileFilter: fileFilter([
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ]),
});

/**
 * General file upload (accepts all configured types)
 */
export const uploadGeneral = multer({
  storage,
  limits: {
    fileSize: awsConfig.getMaxFileSize(),
    files: 5,
  },
  fileFilter: fileFilter(awsConfig.getAllowedMimeTypes()),
});

/**
 * Avatar upload (single image, smaller size)
 */
export const uploadAvatar = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1,
  },
  fileFilter: fileFilter([
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ]),
});

/**
 * Portfolio upload (multiple images/videos)
 */
export const uploadPortfolio = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB per file
    files: 20,
  },
  fileFilter: fileFilter([
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "video/mp4",
    "video/webm",
  ]),
});

/**
 * Handle multer errors
 */
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case "LIMIT_FILE_SIZE":
        return ApiResponse.badRequest(res, "File is too large");
      case "LIMIT_FILE_COUNT":
        return ApiResponse.badRequest(res, "Too many files");
      case "LIMIT_UNEXPECTED_FILE":
        return ApiResponse.badRequest(res, "Unexpected file field");
      default:
        return ApiResponse.badRequest(res, "File upload error");
    }
  }

  if (err.message && err.message.includes("Invalid file type")) {
    return ApiResponse.badRequest(res, err.message);
  }

  next(err);
};

export default {
  uploadImage,
  uploadImages,
  uploadVideo,
  uploadDocument,
  uploadGeneral,
  uploadAvatar,
  uploadPortfolio,
  handleMulterError,
};
