/**
 * Notification Service
 */

import { notificationRepository, userRepository } from "../repositories/index.js";
import Logger from "../utils/logger.util.js";

class NotificationService {
  async sendNotification(userId, notificationData) {
    const { type, title, body, data, channels = ["push"] } = notificationData;

    const notification = await notificationRepository.create({
      userId,
      type,
      title,
      body,
      data,
      isRead: false,
    });

    if (channels.includes("push")) {
      await this.sendPushNotification(userId, { title, body, data });
    }

    if (channels.includes("whatsapp")) {
      await this.sendWhatsAppNotification(userId, { title, body });
    }

    return notification;
  }

  async sendPushNotification(userId, payload) {
    const user = await userRepository.findById(userId);
    if (!user?.fcmToken) return;

    Logger.info("Push notification sent", { userId, payload });
  }

  async sendWhatsAppNotification(userId, payload) {
    const user = await userRepository.findById(userId);
    if (!user?.phone) return;

    Logger.info("WhatsApp notification sent", { userId, payload });
  }

  async getUserNotifications(userId, options = {}) {
    return notificationRepository.findByUserId(userId, options);
  }

  async getUnreadNotifications(userId, options = {}) {
    return notificationRepository.findUnreadByUserId(userId, options);
  }

  async getUnreadCount(userId) {
    return notificationRepository.countUnread(userId);
  }

  async markAsRead(notificationId) {
    return notificationRepository.update(notificationId, { isRead: true });
  }

  async markAllAsRead(userId) {
    return notificationRepository.markAllAsRead(userId);
  }

  async deleteNotification(notificationId) {
    return notificationRepository.delete(notificationId);
  }

  async getStatistics(userId) {
    return notificationRepository.getStatistics(userId);
  }

  async sendNewBookingNotification(userId, data) {
    return this.sendNotification(userId, {
      type: "booking",
      title: "New Booking Request",
      body: `New ${data.eventType} booking for ${data.bookingDate}`,
      data: { ...data, action: "new_booking" },
      channels: ["push", "whatsapp"],
    });
  }

  async sendBookingConfirmationNotification(userId, data) {
    return this.sendNotification(userId, {
      type: "booking",
      title: "Booking Confirmed",
      body: `Your ${data.eventType} booking is confirmed`,
      data: { ...data, action: "booking_confirmed" },
      channels: ["push", "whatsapp"],
    });
  }

  async sendBookingRejectionNotification(userId, data) {
    return this.sendNotification(userId, {
      type: "booking",
      title: "Booking Declined",
      body: data.reason || "Your booking request was declined",
      data: { ...data, action: "booking_rejected" },
      channels: ["push"],
    });
  }

  async sendBookingCancellationNotification(userId, data) {
    return this.sendNotification(userId, {
      type: "booking",
      title: "Booking Cancelled",
      body: data.reason || "Booking has been cancelled",
      data: { ...data, action: "booking_cancelled" },
      channels: ["push", "whatsapp"],
    });
  }

  async sendBookingReminderNotification(userId, data) {
    return this.sendNotification(userId, {
      type: "booking",
      title: "Booking Reminder",
      body: `Reminder: ${data.eventType} booking tomorrow`,
      data: { ...data, action: "booking_reminder" },
      channels: ["push", "whatsapp"],
    });
  }

  async sendReviewRequestNotification(userId, data) {
    return this.sendNotification(userId, {
      type: "review",
      title: "Leave a Review",
      body: "How was your experience?",
      data: { ...data, action: "review_request" },
      channels: ["push"],
    });
  }
}

export default new NotificationService();
