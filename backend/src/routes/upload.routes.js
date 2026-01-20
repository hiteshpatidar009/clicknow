/**
 * Upload Routes
 * /api/v1/uploads
 */

import { Router } from "express";
import { uploadController } from "../controllers/index.js";
import {
  authenticate,
  uploadLimiter,
  professionalOnly,
} from "../middlewares/index.js";
import {
  uploadAvatar,
  uploadPortfolio,
  uploadGeneral,
  handleMulterError,
} from "../middlewares/upload.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import {
  deleteFileSchema,
  getUploadUrlSchema,
  getSignedUrlSchema,
} from "../validators/upload.validator.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Avatar upload
router.post(
  "/avatar",
  uploadLimiter,
  uploadAvatar.single("avatar"),
  handleMulterError,
  uploadController.uploadAvatar,
);

// Portfolio upload (professionals only)
router.post(
  "/portfolio",
  uploadLimiter,
  professionalOnly,
  uploadPortfolio.array("files", 20),
  handleMulterError,
  uploadController.uploadPortfolio,
);

// Chat attachment upload
router.post(
  "/chat",
  uploadLimiter,
  uploadGeneral.single("file"),
  handleMulterError,
  uploadController.uploadChatAttachment,
);

// General upload
router.post(
  "/general",
  uploadLimiter,
  uploadGeneral.single("file"),
  handleMulterError,
  uploadController.uploadGeneral,
);

// Pre-signed URLs
router.post(
  "/presigned-url",
  validate(getUploadUrlSchema),
  uploadController.getUploadUrl,
);
router.get(
  "/signed-url",
  validate(getSignedUrlSchema),
  uploadController.getSignedUrl,
);

// Delete file
router.delete("/", validate(deleteFileSchema), uploadController.deleteFile);

export default router;
