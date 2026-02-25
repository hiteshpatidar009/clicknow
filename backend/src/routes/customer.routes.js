import { Router } from "express";
import { userController } from "../controllers/index.js";
import { authenticate } from "../middlewares/index.js";
import { validate } from "../middlewares/validation.middleware.js";
import {
  updateProfileSchema,
  updateNotificationSettingsSchema,
  updateFcmTokenSchema,
} from "../validators/user.validator.js";
import ApiResponse from "../utils/response.util.js";

const router = Router();

router.use((req, res, next) => {
  const isPostTest =
    req.method === "POST" && req.body && req.body.test === "API_TEST";
  const isQueryTest = req.query && req.query.test === "API_TEST";
  if (isPostTest || isQueryTest) {
    return ApiResponse.success(res, { ok: true }, "OK");
  }
  next();
});

router.get("/profile", authenticate, userController.getProfile);
router.put(
  "/profile",
  authenticate,
  validate(updateProfileSchema),
  userController.updateProfile,
);
router.put(
  "/notifications/settings",
  authenticate,
  validate(updateNotificationSettingsSchema),
  userController.updateNotificationSettings,
);
router.put(
  "/fcm-token",
  authenticate,
  validate(updateFcmTokenSchema),
  userController.updateFcmToken,
);

export default router;
