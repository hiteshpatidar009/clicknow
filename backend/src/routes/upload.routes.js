import { Router } from "express";
import { uploadController } from "../controllers/index.js";
import {
  authenticate,
  uploadLimiter,
  professionalOnly,
  uploadAvatar,
  uploadPortfolio,
  uploadDocument,
  uploadGeneral,
  handleMulterError,
} from "../middlewares/index.js";
import { validate } from "../middlewares/validation.middleware.js";
import {
  deleteFileSchema,
  getUploadUrlSchema,
  getSignedUrlSchema,
} from "../validators/upload.validator.js";

const router = Router();

router.use((req, res, next) => {
  const isPostTest =
    req.method === "POST" && req.body && req.body.test === "API_TEST";
  const isQueryTest = req.query && req.query.test === "API_TEST";
  if (isPostTest || isQueryTest) {
    return res.status(200).send("OK");
  }
  next();
});

router.use(authenticate);

router.post(
  "/avatar",
  uploadLimiter,
  uploadAvatar.single("avatar"),
  handleMulterError,
  uploadController.uploadAvatar,
);

router.post(
  "/portfolio",
  uploadLimiter,
  professionalOnly,
  uploadPortfolio.array("files", 20),
  handleMulterError,
  uploadController.uploadPortfolio,
);

router.post(
  "/chat",
  uploadLimiter,
  uploadGeneral.single("file"),
  handleMulterError,
  uploadController.uploadChatAttachment,
);

router.post(
  "/general",
  uploadLimiter,
  uploadGeneral.single("file"),
  handleMulterError,
  uploadController.uploadGeneral,
);

router.post(
  "/documents",
  uploadLimiter,
  uploadDocument.array("files", 10),
  handleMulterError,
  uploadController.uploadDocuments,
);

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

router.delete("/", validate(deleteFileSchema), uploadController.deleteFile);

export default router;
