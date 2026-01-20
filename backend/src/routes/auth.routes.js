/**
 * Auth Routes
 * /api/v1/auth
 */

import { Router } from "express";
import { authController } from "../controllers/index.js";
import { authenticate, authLimiter } from "../middlewares/index.js";
import { validate } from "../middlewares/validation.middleware.js";
import {
  registerSchema,
  loginSchema,
  firebaseLoginSchema,
  refreshTokenSchema,
  changePasswordSchema,
} from "../validators/auth.validator.js";

const router = Router();

// Public routes
router.post(
  "/register",
  authLimiter,
  validate(registerSchema),
  authController.register,
);
router.post("/login", authLimiter, validate(loginSchema), authController.login);
router.post(
  "/firebase",
  authLimiter,
  validate(firebaseLoginSchema),
  authController.firebaseLogin,
);
router.post(
  "/refresh",
  validate(refreshTokenSchema),
  authController.refreshToken,
);

// Protected routes
router.post(
  "/change-password",
  authenticate,
  validate(changePasswordSchema),
  authController.changePassword,
);
router.post("/logout", authenticate, authController.logout);
router.get("/me", authenticate, authController.getMe);

export default router;
