import { notificationService } from "../services/index.js";
import ApiResponse from "../utils/response.util.js";
import { asyncHandler } from "../middlewares/error.middleware.js";

class NotificationController {
  /**
   * GET /api/v1/notifications
   */
  getNotifications = asyncHandler(async (req, res) => {
    const { page, pageSize, type } = req.query;
    const result = await notificationService.getUserNotifications(
      req.user.userId,
      {
        page: parseInt(page) || 1,
        pageSize: parseInt(pageSize) || 20,
        type,
      },
    );
    return ApiResponse.paginated(res, result.data, result.pagination);
  });

  /**
   * GET /api/v1/notifications/unread
   */
  getUnreadNotifications = asyncHandler(async (req, res) => {
    const { page, pageSize } = req.query;
    const result = await notificationService.getUnreadNotifications(
      req.user.userId,
      {
        page: parseInt(page) || 1,
        pageSize: parseInt(pageSize) || 20,
      },
    );
    return ApiResponse.paginated(res, result.data, result.pagination);
  });

  /**
   * GET /api/v1/notifications/unread-count
   */
  getUnreadCount = asyncHandler(async (req, res) => {
    const count = await notificationService.getUnreadCount(req.user.userId);
    return ApiResponse.success(res, { unreadCount: count });
  });

  /**
   * PUT /api/v1/notifications/:id/read
   */
  markAsRead = asyncHandler(async (req, res) => {
    await notificationService.markAsRead(req.params.id);
    return ApiResponse.success(res, null, "Notification marked as read");
  });

  /**
   * PUT /api/v1/notifications/read-all
   */
  markAllAsRead = asyncHandler(async (req, res) => {
    await notificationService.markAllAsRead(req.user.userId);
    return ApiResponse.success(res, null, "All notifications marked as read");
  });

  /**
   * DELETE /api/v1/notifications/:id
   */
  deleteNotification = asyncHandler(async (req, res) => {
    await notificationService.deleteNotification(req.params.id);
    return ApiResponse.success(res, null, "Notification deleted");
  });

  /**
   * GET /api/v1/notifications/statistics
   */
  getStatistics = asyncHandler(async (req, res) => {
    const stats = await notificationService.getStatistics(req.user.userId);
    return ApiResponse.success(res, stats);
  });
}

export default NotificationController;
