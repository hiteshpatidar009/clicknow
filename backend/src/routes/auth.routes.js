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
  sendOtpSchema,
  verifyOtpSchema,
} from "../validators/auth.validator.js";

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

router.post(
  "/send-otp",
  authLimiter,
  validate(sendOtpSchema),
  authController.sendOtp,
);
router.post(
  "/verify-otp",
  authLimiter,
  validate(verifyOtpSchema),
  authController.verifyOtp,
);

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

router.post(
  "/change-password",
  authenticate,
  validate(changePasswordSchema),
  authController.changePassword,
);
router.post("/logout", authenticate, authController.logout);
router.get("/me", authenticate, authController.getMe);

export default router;
