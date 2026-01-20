/**
 * Auth Controller
 * Handles authentication endpoints
 */

import { authService } from "../services/index.js";
import ApiResponse from "../utils/response.util.js";
import { asyncHandler } from "../middlewares/error.middleware.js";

class AuthController {
  /**
   * POST /api/v1/auth/register
   */
  register = asyncHandler(async (req, res) => {
    const result = await authService.register(req.body);
    return ApiResponse.created(res, result, "Registration successful");
  });

  /**
   * POST /api/v1/auth/login
   */
  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await authService.loginWithEmail(email, password);
    return ApiResponse.success(res, result, "Login successful");
  });

  /**
   * POST /api/v1/auth/firebase
   */
  firebaseLogin = asyncHandler(async (req, res) => {
    const { firebaseToken } = req.body;
    const result = await authService.loginWithFirebase(firebaseToken);
    return ApiResponse.success(res, result, "Login successful");
  });

  /**
   * POST /api/v1/auth/refresh
   */
  refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    const tokens = await authService.refreshToken(refreshToken);
    return ApiResponse.success(res, tokens, "Token refreshed");
  });

  /**
   * POST /api/v1/auth/change-password
   */
  changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(
      req.user.userId,
      currentPassword,
      newPassword,
    );
    return ApiResponse.success(res, null, "Password changed successfully");
  });

  /**
   * POST /api/v1/auth/logout
   */
  logout = asyncHandler(async (req, res) => {
    await authService.logout(req.user.userId);
    return ApiResponse.success(res, null, "Logout successful");
  });

  /**
   * GET /api/v1/auth/me
   */
  getMe = asyncHandler(async (req, res) => {
    const user = await authService.getUserFromToken(req.user.userId);
    return ApiResponse.success(res, user);
  });
}

export default new AuthController();
