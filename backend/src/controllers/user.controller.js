/**
 * User Controller
 * Handles user profile endpoints
 */

import { userService } from "../services/index.js";
import ApiResponse from "../utils/response.util.js";
import { asyncHandler } from "../middlewares/error.middleware.js";

class UserController {
  /**
   * GET /api/v1/users/profile
   */
  getProfile = asyncHandler(async (req, res) => {
    const user = await userService.getProfile(req.user.userId);
    return ApiResponse.success(res, user);
  });

  /**
   * PUT /api/v1/users/profile
   */
  updateProfile = asyncHandler(async (req, res) => {
    const user = await userService.updateProfile(req.user.userId, req.body);
    return ApiResponse.success(res, user, "Profile updated successfully");
  });

  /**
   * PUT /api/v1/users/notifications/settings
   */
  updateNotificationSettings = asyncHandler(async (req, res) => {
    const user = await userService.updateNotificationSettings(
      req.user.userId,
      req.body,
    );
    return ApiResponse.success(res, user, "Notification settings updated");
  });

  /**
   * PUT /api/v1/users/fcm-token
   */
  updateFcmToken = asyncHandler(async (req, res) => {
    const { fcmToken } = req.body;
    await userService.updateFcmToken(req.user.userId, fcmToken);
    return ApiResponse.success(res, null, "FCM token updated");
  });

  /**
   * GET /api/v1/users/:id (Admin)
   */
  getUserById = asyncHandler(async (req, res) => {
    const user = await userService.getUserById(req.params.id);
    return ApiResponse.success(res, user);
  });

  /**
   * GET /api/v1/users (Admin)
   */
  getUsers = asyncHandler(async (req, res) => {
    const { role, isActive, page, pageSize, search } = req.query;
    const result = await userService.getUsers({
      role,
      isActive:
        isActive === "true" ? true
        : isActive === "false" ? false
        : undefined,
      page: parseInt(page) || 1,
      pageSize: parseInt(pageSize) || 20,
      search,
    });
    return ApiResponse.paginated(res, result.data, result.pagination);
  });

  /**
   * PUT /api/v1/users/:id/activate (Admin)
   */
  activateUser = asyncHandler(async (req, res) => {
    const user = await userService.activateUser(req.params.id);
    return ApiResponse.success(res, user, "User activated");
  });

  /**
   * PUT /api/v1/users/:id/deactivate (Admin)
   */
  deactivateUser = asyncHandler(async (req, res) => {
    const user = await userService.deactivateUser(req.params.id);
    return ApiResponse.success(res, user, "User deactivated");
  });

  /**
   * DELETE /api/v1/users/:id (Admin)
   */
  deleteUser = asyncHandler(async (req, res) => {
    await userService.deleteUser(req.params.id);
    return ApiResponse.success(res, null, "User deleted");
  });

  /**
   * GET /api/v1/users/statistics (Admin)
   */
  getStatistics = asyncHandler(async (req, res) => {
    const stats = await userService.getStatistics();
    return ApiResponse.success(res, stats);
  });
}

export default new UserController();
