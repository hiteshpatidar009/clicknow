import { storageService, professionalService } from "../services/index.js";
import ApiResponse from "../utils/response.util.js";
import { asyncHandler } from "../middlewares/error.middleware.js";

class UploadController {
  /**
   * POST /api/v1/uploads/avatar
   */
  uploadAvatar = asyncHandler(async (req, res) => {
    if (!req.file) {
      return ApiResponse.badRequest(res, "No file provided");
    }

    const result = await storageService.uploadFile(req.file, {
      folder: "avatars",
      userId: req.user.userId,
    });

    return ApiResponse.success(res, result, "Avatar uploaded");
  });

  /**
   * POST /api/v1/uploads/portfolio
   */
  uploadPortfolio = asyncHandler(async (req, res) => {
    const myProfile = await professionalService.getByUserId(req.user.userId);

    if (!req.files || req.files.length === 0) {
      return ApiResponse.badRequest(res, "No files provided");
    }

    const results = await storageService.uploadMultiple(req.files, {
      folder: `portfolio/${myProfile.id}`,
      userId: req.user.userId,
    });

    return ApiResponse.success(res, results, "Portfolio items uploaded");
  });

  /**
   * POST /api/v1/uploads/chat
   */
  uploadChatAttachment = asyncHandler(async (req, res) => {
    if (!req.file) {
      return ApiResponse.badRequest(res, "No file provided");
    }

    const result = await storageService.uploadFile(req.file, {
      folder: "chat-attachments",
      userId: req.user.userId,
    });

    return ApiResponse.success(res, result, "Attachment uploaded");
  });

  /**
   * POST /api/v1/uploads/general
   */
  uploadGeneral = asyncHandler(async (req, res) => {
    if (!req.file) {
      return ApiResponse.badRequest(res, "No file provided");
    }

    const { folder } = req.body;
    const result = await storageService.uploadFile(req.file, {
      folder: folder || "general",
      userId: req.user.userId,
    });

    return ApiResponse.success(res, result, "File uploaded");
  });

  /**
   * POST /api/v1/uploads/documents
   * Upload KYC/professional documents to S3
   */
  uploadDocuments = asyncHandler(async (req, res) => {
    if (!req.files || req.files.length === 0) {
      return ApiResponse.badRequest(res, "No files provided");
    }

    const results = await storageService.uploadMultiple(req.files, {
      folder: "documents",
      userId: req.user.userId,
    });

    return ApiResponse.success(
      res,
      { files: results },
      "Documents uploaded successfully",
    );
  });

  /**
   * DELETE /api/v1/uploads
   */
  deleteFile = asyncHandler(async (req, res) => {
    const { key } = req.body;
    await storageService.deleteFile(key);
    return ApiResponse.success(res, null, "File deleted");
  });

  /**
   * POST /api/v1/uploads/presigned-url
   */
  getUploadUrl = asyncHandler(async (req, res) => {
    const { fileName, contentType, folder } = req.body;
    const result = await storageService.getUploadUrl(
      fileName,
      contentType,
      folder,
    );
    return ApiResponse.success(res, result);
  });

  /**
   * GET /api/v1/uploads/signed-url
   */
  getSignedUrl = asyncHandler(async (req, res) => {
    const { key, expiresIn } = req.query;
    const parsedExpires = Number.parseInt(expiresIn, 10);
    const url = await storageService.getSignedUrl(
      key,
      Number.isFinite(parsedExpires) ? parsedExpires : undefined,
    );
    return ApiResponse.success(res, { url });
  });
}

export default UploadController;
