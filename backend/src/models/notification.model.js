/**
 * Notification Model
 * Defines notification data structure
 */

import { NOTIFICATION_TYPES } from "../utils/constants.util.js";

class NotificationModel {
  constructor(data = {}) {
    this.id = data.id || null;
    this.userId = data.userId || null;
    this.type = data.type || NOTIFICATION_TYPES.SYSTEM;
    this.title = data.title || "";
    this.body = data.body || "";
    this.data = data.data || {};
    this.imageUrl = data.imageUrl || null;
    this.actionUrl = data.actionUrl || null;
    this.channels = data.channels || ["push", "in_app"];
    this.isRead = data.isRead || false;
    this.readAt = data.readAt || null;
    this.isSent = data.isSent || false;
    this.sentVia = data.sentVia || {};
    this.isDeleted = data.isDeleted || false;
    this.createdAt = data.createdAt || null;
    this.updatedAt = data.updatedAt || null;
  }

  /**
   * Check if notification is read
   */
  isReadStatus() {
    return this.isRead;
  }

  /**
   * Mark as read
   */
  markAsRead() {
    this.isRead = true;
    this.readAt = new Date().toISOString();
  }

  /**
   * Mark as sent via channel
   */
  markAsSent(channel) {
    this.isSent = true;
    this.sentVia[channel] = new Date().toISOString();
  }

  /**
   * Get FCM payload for push notification
   */
  getFCMPayload() {
    return {
      notification: {
        title: this.title,
        body: this.body,
        imageUrl: this.imageUrl,
      },
      data: {
        notificationId: this.id,
        type: this.type,
        actionUrl: this.actionUrl,
        ...this.data,
      },
    };
  }

  /**
   * Convert to plain object for database storage
   */
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      type: this.type,
      title: this.title,
      body: this.body,
      data: this.data,
      imageUrl: this.imageUrl,
      actionUrl: this.actionUrl,
      channels: this.channels,
      isRead: this.isRead,
      readAt: this.readAt,
      isSent: this.isSent,
      sentVia: this.sentVia,
      isDeleted: this.isDeleted,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Convert to list view
   */
  toListView() {
    return {
      id: this.id,
      type: this.type,
      title: this.title,
      body: this.body,
      imageUrl: this.imageUrl,
      actionUrl: this.actionUrl,
      isRead: this.isRead,
      createdAt: this.createdAt,
    };
  }

  /**
   * Create NotificationModel from database document
   */
  static fromDocument(doc) {
    return new NotificationModel(doc);
  }

  /**
   * Create notification for booking confirmation
   */
  static forBookingConfirmation(userId, bookingData) {
    return new NotificationModel({
      userId,
      type: NOTIFICATION_TYPES.BOOKING,
      title: "Booking Confirmed",
      body: `Your booking for ${bookingData.eventType} on ${bookingData.bookingDate} has been confirmed.`,
      data: {
        bookingId: bookingData.bookingId,
        action: "booking_confirmed",
      },
      actionUrl: `/bookings/${bookingData.bookingId}`,
      channels: ["push", "in_app", "whatsapp"],
    });
  }

  /**
   * Create notification for new booking request
   */
  static forNewBookingRequest(professionalUserId, bookingData) {
    return new NotificationModel({
      userId: professionalUserId,
      type: NOTIFICATION_TYPES.BOOKING,
      title: "New Booking Request",
      body: `You have a new booking request for ${bookingData.eventType} on ${bookingData.bookingDate}.`,
      data: {
        bookingId: bookingData.bookingId,
        action: "new_booking",
      },
      actionUrl: `/bookings/${bookingData.bookingId}`,
      channels: ["push", "in_app", "whatsapp"],
    });
  }

  /**
   * Create notification for booking reminder
   */
  static forBookingReminder(userId, bookingData) {
    return new NotificationModel({
      userId,
      type: NOTIFICATION_TYPES.REMINDER,
      title: "Booking Reminder",
      body: `Reminder: You have a booking tomorrow for ${bookingData.eventType}.`,
      data: {
        bookingId: bookingData.bookingId,
        action: "booking_reminder",
      },
      actionUrl: `/bookings/${bookingData.bookingId}`,
      channels: ["push", "in_app", "whatsapp"],
    });
  }

  /**
   * Create notification for new review
   */
  static forNewReview(professionalUserId, reviewData) {
    return new NotificationModel({
      userId: professionalUserId,
      type: NOTIFICATION_TYPES.REVIEW,
      title: "New Review Received",
      body: `You received a ${reviewData.rating}-star review.`,
      data: {
        reviewId: reviewData.reviewId,
        rating: reviewData.rating,
        action: "new_review",
      },
      actionUrl: `/reviews/${reviewData.reviewId}`,
      channels: ["push", "in_app"],
    });
  }

  /**
   * Create notification for new enquiry
   */
  static forNewEnquiry(professionalUserId, enquiryData) {
    return new NotificationModel({
      userId: professionalUserId,
      type: NOTIFICATION_TYPES.ENQUIRY,
      title: "New Enquiry Received",
      body: `You received a new enquiry for ${enquiryData.eventType}.`,
      data: {
        enquiryId: enquiryData.enquiryId,
        action: "new_enquiry",
      },
      actionUrl: `/enquiries/${enquiryData.enquiryId}`,
      channels: ["push", "in_app", "whatsapp"],
    });
  }

  /**
   * Create notification for profile approval
   */
  static forProfileApproval(userId) {
    return new NotificationModel({
      userId,
      type: NOTIFICATION_TYPES.SYSTEM,
      title: "Profile Approved",
      body: "Congratulations! Your professional profile has been approved. You can now receive bookings.",
      data: {
        action: "profile_approved",
      },
      actionUrl: "/profile",
      channels: ["push", "in_app", "whatsapp"],
    });
  }

  /**
   * Create notification for profile rejection
   */
  static forProfileRejection(userId, reason) {
    return new NotificationModel({
      userId,
      type: NOTIFICATION_TYPES.SYSTEM,
      title: "Profile Update Required",
      body: `Your profile needs updates. Reason: ${reason}`,
      data: {
        action: "profile_rejected",
        reason,
      },
      actionUrl: "/profile/edit",
      channels: ["push", "in_app", "whatsapp"],
    });
  }

  /**
   * Create marketing notification
   */
  static forMarketing(userId, data) {
    return new NotificationModel({
      userId,
      type: NOTIFICATION_TYPES.MARKETING,
      title: data.title,
      body: data.body,
      imageUrl: data.imageUrl,
      data: {
        action: "marketing",
        campaignId: data.campaignId,
      },
      actionUrl: data.actionUrl,
      channels: ["push", "in_app"],
    });
  }
}

export default NotificationModel;
