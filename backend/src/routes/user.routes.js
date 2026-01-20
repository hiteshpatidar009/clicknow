/**
 * User Routes
 * /api/v1/users
 */

import { Router } from "express";
import { userController } from "../controllers/index.js";
import { authenticate, adminOnly } from "../middlewares/index.js";
import { validate } from "../middlewares/validation.middleware.js";
import {
  updateProfileSchema,
  updateNotificationSettingsSchema,
  updateFcmTokenSchema,
  getUsersSchema,
  userIdParamSchema,
} from "../validators/user.validator.js";

const router = Router();

// Protected routes
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

// Admin routes
router.get(
  "/",
  authenticate,
  adminOnly,
  validate(getUsersSchema),
  userController.getUsers,
);
router.get(
  "/statistics",
  authenticate,
  adminOnly,
  userController.getStatistics,
);
router.get(
  "/:id",
  authenticate,
  adminOnly,
  validate(userIdParamSchema),
  userController.getUserById,
);
router.put(
  "/:id/activate",
  authenticate,
  adminOnly,
  validate(userIdParamSchema),
  userController.activateUser,
);
router.put(
  "/:id/deactivate",
  authenticate,
  adminOnly,
  validate(userIdParamSchema),
  userController.deactivateUser,
);
router.delete(
  "/:id",
  authenticate,
  adminOnly,
  validate(userIdParamSchema),
  userController.deleteUser,
);

export default router;
