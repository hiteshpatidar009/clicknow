import multer from "multer";
import ApiResponse from "../utils/response.util.js";

const storage = multer.memoryStorage();
const maxFileSize = 10 * 1024 * 1024;

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

class UploadMiddleware {
  constructor() {
    this.uploadImage = multer({
      storage,
      limits: { fileSize: maxFileSize, files: 1 },
      fileFilter: fileFilter([
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "image/gif",
      ]),
    });

    this.uploadImages = multer({
      storage,
      limits: { fileSize: maxFileSize, files: 10 },
      fileFilter: fileFilter([
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "image/gif",
      ]),
    });

    this.uploadVideo = multer({
      storage,
      limits: { fileSize: 100 * 1024 * 1024, files: 1 },
      fileFilter: fileFilter(["video/mp4", "video/webm", "video/quicktime"]),
    });

    this.uploadDocument = multer({
      storage,
      limits: { fileSize: 10 * 1024 * 1024, files: 5 },
      fileFilter: fileFilter([
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ]),
    });

    this.uploadGeneral = multer({
      storage,
      limits: { fileSize: maxFileSize, files: 5 },
      fileFilter: fileFilter([
        "image/jpeg",
        "image/png",
        "image/webp",
        "video/mp4",
      ]),
    });

    this.uploadAvatar = multer({
      storage,
      limits: { fileSize: 5 * 1024 * 1024, files: 1 },
      fileFilter: fileFilter([
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ]),
    });

    this.uploadPortfolio = multer({
      storage,
      limits: { fileSize: 50 * 1024 * 1024, files: 20 },
      fileFilter: fileFilter([
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "video/mp4",
        "video/webm",
      ]),
    });
  }

  handleMulterError = (err, req, res, next) => {
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
}

export default new UploadMiddleware();
