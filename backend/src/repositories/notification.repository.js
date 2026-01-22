/**
 * Notification Repository
 */

import BaseRepository from "./base.repository.js";
import { COLLECTIONS } from "../utils/constants.util.js";

class NotificationRepository extends BaseRepository {
  constructor() {
    super(COLLECTIONS.NOTIFICATIONS);
  }

  async findByUserId(userId, options = {}) {
    return this.findPaginated({
      ...options,
      where: [{ field: "userId", operator: "==", value: userId }],
      orderBy: "createdAt",
      orderDirection: "desc",
    });
  }

  async findUnreadByUserId(userId, options = {}) {
    return this.findPaginated({
      ...options,
      where: [
        { field: "userId", operator: "==", value: userId },
        { field: "isRead", operator: "==", value: false },
      ],
      orderBy: "createdAt",
      orderDirection: "desc",
    });
  }

  async countUnread(userId) {
    return this.count([
      { field: "userId", operator: "==", value: userId },
      { field: "isRead", operator: "==", value: false },
    ]);
  }

  async markAllAsRead(userId) {
    const notifications = await this.findAll({
      where: [
        { field: "userId", operator: "==", value: userId },
        { field: "isRead", operator: "==", value: false },
      ],
    });

    const updates = notifications.map((n) => ({
      id: n.id,
      data: { isRead: true },
    }));

    return this.batchUpdate(updates);
  }

  async getStatistics(userId) {
    const [total, unread] = await Promise.all([
      this.count([{ field: "userId", operator: "==", value: userId }]),
      this.countUnread(userId),
    ]);

    return { total, unread };
  }
}

export default new NotificationRepository();
