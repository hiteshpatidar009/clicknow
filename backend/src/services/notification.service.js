/**
 * Notification Service
 * Handles push notifications, in-app notifications, and WhatsApp alerts
 */

import axios from "axios";
import admin from "firebase-admin";
import { whatsappConfig } from "../config/index.js";
import {
  notificationRepository,
  userRepository,
} from "../repositories/index.js";
import { NotificationModel } from "../models/index.js";
import Logger from "../utils/logger.util.js";

class NotificationService {
  /**
   * Create and send notification
   */
  async sendNotification(userId, notificationData) {
    // Create in-app notification
    const notification = await notificationRepository.createWithDefaults({
      userId,
      ...notificationData,
    });

    // Get user for FCM token
    const user = await userRepository.findById(userId);

    // Send push notification if user has FCM token
    if (user?.fcmToken && notificationData.channels?.includes("push")) {
      await this.sendPushNotification(user.fcmToken, notification);
    }

    // Send WhatsApp if enabled
    if (
      user?.phone &&
      notificationData.channels?.includes("whatsapp") &&
      user?.settings?.notifications?.whatsapp
    ) {
      await this.sendWhatsAppNotification(user.phone, notification);
    }

    return notification;
  }

  /**
   * Send push notification via FCM
   */
  async sendPushNotification(fcmToken, notification) {
    try {
      const model = NotificationModel.fromDocument(notification);
      const payload = model.getFCMPayload();

      await admin.messaging().send({
        token: fcmToken,
        ...payload,
      });

      await notificationRepository.markAsSent(notification.id, "push");

      Logger.logExternalCall("FCM", "send_notification", true);
    } catch (error) {
      Logger.error("FCM notification failed", error);
      Logger.logExternalCall("FCM", "send_notification", false);
    }
  }

  /**
   * Send WhatsApp notification
   */
  async sendWhatsAppNotification(phone, notification) {
    if (!whatsappConfig.isConfigured()) {
      Logger.warn("WhatsApp not configured, skipping notification");
      return;
    }

    try {
      const response = await axios.post(
        whatsappConfig.getApiUrl(),
        {
          messaging_product: "whatsapp",
          to: phone,
          type: "template",
          template: {
            name: whatsappConfig.getTemplate(notification.type),
            language: { code: "en" },
            components: [
              {
                type: "body",
                parameters: [
                  { type: "text", text: notification.title },
                  { type: "text", text: notification.body },
                ],
              },
            ],
          },
        },
        { headers: whatsappConfig.getHeaders() },
      );

      await notificationRepository.markAsSent(notification.id, "whatsapp");

      Logger.logExternalCall("WhatsApp", "send_notification", true);
    } catch (error) {
      Logger.error("WhatsApp notification failed", error);
      Logger.logExternalCall("WhatsApp", "send_notification", false);
    }
  }

  /**
   * Send bulk push notifications
   */
  async sendBulkPushNotification(userIds, notificationData) {
    const users = await Promise.all(
      userIds.map((id) => userRepository.findById(id)),
    );

    const tokens = users.filter((u) => u?.fcmToken).map((u) => u.fcmToken);

    if (tokens.length === 0) return;

    try {
      const message = {
        notification: {
          title: notificationData.title,
          body: notificationData.body,
        },
        data: notificationData.data || {},
        tokens,
      };

      const response = await admin.messaging().sendEachForMulticast(message);

      Logger.logExternalCall("FCM", "send_bulk_notification", true, null);
      Logger.info(
        `Bulk notification sent: ${response.successCount} success, ${response.failureCount} failures`,
      );
    } catch (error) {
      Logger.error("Bulk FCM notification failed", error);
    }
  }

  // Convenience methods for specific notification types

  async sendBookingConfirmationNotification(userId, bookingData) {
    const notification = NotificationModel.forBookingConfirmation(
      userId,
      bookingData,
    );
    return this.sendNotification(userId, notification.toJSON());
  }

  async sendNewBookingNotification(userId, bookingData) {
    const notification = NotificationModel.forNewBookingRequest(
      userId,
      bookingData,
    );
    return this.sendNotification(userId, notification.toJSON());
  }

  async sendBookingReminderNotification(userId, bookingData) {
    const notification = NotificationModel.forBookingReminder(
      userId,
      bookingData,
    );
    return this.sendNotification(userId, notification.toJSON());
  }

  async sendBookingCancellationNotification(userId, data) {
    return this.sendNotification(userId, {
      type: "booking",
      title: "Booking Cancelled",
      body: `Your booking has been cancelled. ${data.reason ? `Reason: ${data.reason}` : ""}`,
      data: { bookingId: data.bookingId, action: "booking_cancelled" },
      channels: ["push", "in_app", "whatsapp"],
    });
  }

  async sendBookingRejectionNotification(userId, data) {
    return this.sendNotification(userId, {
      type: "booking",
      title: "Booking Request Declined",
      body: `Your booking request was declined. ${data.reason ? `Reason: ${data.reason}` : ""}`,
      data: { bookingId: data.bookingId, action: "booking_rejected" },
      channels: ["push", "in_app", "whatsapp"],
    });
  }

  async sendNewReviewNotification(userId, reviewData) {
    const notification = NotificationModel.forNewReview(userId, reviewData);
    return this.sendNotification(userId, notification.toJSON());
  }

  async sendReviewRequestNotification(userId, data) {
    return this.sendNotification(userId, {
      type: "review",
      title: "How was your experience?",
      body: "Please leave a review for your recent booking.",
      data: { bookingId: data.bookingId, action: "review_request" },
      channels: ["push", "in_app"],
    });
  }

  async sendNewEnquiryNotification(userId, enquiryData) {
    const notification = NotificationModel.forNewEnquiry(userId, enquiryData);
    return this.sendNotification(userId, notification.toJSON());
  }

  async sendProfileApprovalNotification(userId) {
    const notification = NotificationModel.forProfileApproval(userId);
    return this.sendNotification(userId, notification.toJSON());
  }

  async sendProfileRejectionNotification(userId, reason) {
    const notification = NotificationModel.forProfileRejection(userId, reason);
    return this.sendNotification(userId, notification.toJSON());
  }

  async sendMarketingNotification(userId, data) {
    const notification = NotificationModel.forMarketing(userId, data);
    return this.sendNotification(userId, notification.toJSON());
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(userId, options = {}) {
    return notificationRepository.findByUserId(userId, options);
  }

  /**
   * Get unread notifications
   */
  async getUnreadNotifications(userId, options = {}) {
    return notificationRepository.findUnread(userId, options);
  }

  /**
   * Get unread count
   */
  async getUnreadCount(userId) {
    return notificationRepository.getUnreadCount(userId);
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId) {
    return notificationRepository.markAsRead(notificationId);
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId) {
    return notificationRepository.markAllAsRead(userId);
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId) {
    return notificationRepository.softDelete(notificationId);
  }

  /**
   * Get notification statistics
   */
  async getStatistics(userId) {
    return notificationRepository.getStatistics(userId);
  }
}

export default new NotificationService();
