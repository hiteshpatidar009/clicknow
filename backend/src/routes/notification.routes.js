/**
 * Notification Routes
 * /api/v1/notifications
 */

import { Router } from "express";
import { notificationController } from "../controllers/index.js";
import { authenticate } from "../middlewares/index.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get("/", notificationController.getNotifications);
router.get("/unread", notificationController.getUnreadNotifications);
router.get("/unread-count", notificationController.getUnreadCount);
router.get("/statistics", notificationController.getStatistics);
router.put("/read-all", notificationController.markAllAsRead);
router.put("/:id/read", notificationController.markAsRead);
router.delete("/:id", notificationController.deleteNotification);

export default router;
