/**
 * Notification Repository
 * Data access layer for notification documents
 */

import BaseRepository from "./base.repository.js";
import { COLLECTIONS } from "../utils/constants.util.js";

class NotificationRepository extends BaseRepository {
  constructor() {
    super(COLLECTIONS.NOTIFICATIONS);
  }

  /**
   * Find notifications for a user
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated notifications
   */
  async findByUserId(userId, options = {}) {
    return this.findPaginated({
      ...options,
      where: [
        { field: "userId", operator: "==", value: userId },
        { field: "isDeleted", operator: "==", value: false },
        ...(options.where || []),
      ],
      orderBy: "createdAt",
      orderDirection: "desc",
    });
  }

  /**
   * Find unread notifications for a user
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated notifications
   */
  async findUnread(userId, options = {}) {
    return this.findPaginated({
      ...options,
      where: [
        { field: "userId", operator: "==", value: userId },
        { field: "isRead", operator: "==", value: false },
        { field: "isDeleted", operator: "==", value: false },
        ...(options.where || []),
      ],
      orderBy: "createdAt",
      orderDirection: "desc",
    });
  }

  /**
   * Get unread count for user
   * @param {string} userId - User ID
   * @returns {Promise<number>} Unread count
   */
  async getUnreadCount(userId) {
    return this.count([
      { field: "userId", operator: "==", value: userId },
      { field: "isRead", operator: "==", value: false },
      { field: "isDeleted", operator: "==", value: false },
    ]);
  }

  /**
   * Find notifications by type
   * @param {string} userId - User ID
   * @param {string} type - Notification type
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated notifications
   */
  async findByType(userId, type, options = {}) {
    return this.findPaginated({
      ...options,
      where: [
        { field: "userId", operator: "==", value: userId },
        { field: "type", operator: "==", value: type },
        { field: "isDeleted", operator: "==", value: false },
        ...(options.where || []),
      ],
      orderBy: "createdAt",
      orderDirection: "desc",
    });
  }

  /**
   * Mark notification as read
   * @param {string} id - Notification ID
   * @returns {Promise<Object>} Updated notification
   */
  async markAsRead(id) {
    return this.update(id, {
      isRead: true,
      readAt: this.db.timestamp(),
    });
  }

  /**
   * Mark all notifications as read for user
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} Success status
   */
  async markAllAsRead(userId) {
    const unread = await this.findAll({
      where: [
        { field: "userId", operator: "==", value: userId },
        { field: "isRead", operator: "==", value: false },
        { field: "isDeleted", operator: "==", value: false },
      ],
    });

    if (unread.length === 0) {
      return true;
    }

    const updates = unread.map((notification) => ({
      id: notification.id,
      data: {
        isRead: true,
        readAt: this.db.timestamp(),
      },
    }));

    return this.batchUpdate(updates);
  }

  /**
   * Create notification with push
   * @param {Object} data - Notification data
   * @returns {Promise<Object>} Created notification
   */
  async createWithDefaults(data) {
    return this.create({
      ...data,
      isRead: false,
      isSent: false,
      channels: data.channels || ["push", "in_app"],
    });
  }

  /**
   * Mark notification as sent
   * @param {string} id - Notification ID
   * @param {string} channel - Channel (push, whatsapp, email)
   * @returns {Promise<Object>} Updated notification
   */
  async markAsSent(id, channel) {
    return this.update(id, {
      isSent: true,
      [`sentVia.${channel}`]: this.db.timestamp(),
    });
  }

  /**
   * Find pending notifications for delivery
   * @param {string} channel - Delivery channel
   * @param {number} limit - Max notifications to retrieve
   * @returns {Promise<Array>} Pending notifications
   */
  async findPendingDelivery(channel, limit = 100) {
    return this.findAll({
      where: [
        { field: "channels", operator: "array-contains", value: channel },
        { field: `sentVia.${channel}`, operator: "==", value: null },
        { field: "isDeleted", operator: "==", value: false },
      ],
      orderBy: "createdAt",
      orderDirection: "asc",
      limit,
    });
  }

  /**
   * Delete old notifications
   * @param {number} daysOld - Delete notifications older than this many days
   * @returns {Promise<number>} Number of deleted notifications
   */
  async deleteOldNotifications(daysOld = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const oldNotifications = await this.findAll({
      where: [
        { field: "createdAt", operator: "<", value: cutoffDate },
        { field: "isRead", operator: "==", value: true },
      ],
      limit: 500, // Batch limit
    });

    if (oldNotifications.length === 0) {
      return 0;
    }

    const ids = oldNotifications.map((n) => n.id);
    await this.batchDelete(ids);

    return ids.length;
  }

  /**
   * Get notification statistics for user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Notification statistics
   */
  async getStatistics(userId) {
    const [total, unread, byType] = await Promise.all([
      this.count([
        { field: "userId", operator: "==", value: userId },
        { field: "isDeleted", operator: "==", value: false },
      ]),
      this.count([
        { field: "userId", operator: "==", value: userId },
        { field: "isRead", operator: "==", value: false },
        { field: "isDeleted", operator: "==", value: false },
      ]),
      this.getCountByType(userId),
    ]);

    return {
      total,
      unread,
      read: total - unread,
      byType,
    };
  }

  /**
   * Get notification count by type
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Count by type
   */
  async getCountByType(userId) {
    const types = ["booking", "review", "chat", "marketing", "system"];
    const counts = {};

    for (const type of types) {
      counts[type] = await this.count([
        { field: "userId", operator: "==", value: userId },
        { field: "type", operator: "==", value: type },
        { field: "isDeleted", operator: "==", value: false },
      ]);
    }

    return counts;
  }
}

export default new NotificationRepository();
