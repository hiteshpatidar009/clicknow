/**
 * Booking Repository
 * Data access layer for booking documents
 */

import BaseRepository from "./base.repository.js";
import { COLLECTIONS, BOOKING_STATUS } from "../utils/constants.util.js";

class BookingRepository extends BaseRepository {
  constructor() {
    super(COLLECTIONS.BOOKINGS);
  }

  /**
   * Find bookings by client ID
   * @param {string} clientId - Client user ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated bookings
   */
  async findByClientId(clientId, options = {}) {
    return this.findPaginated({
      ...options,
      where: [
        { field: "clientId", operator: "==", value: clientId },
        { field: "isDeleted", operator: "==", value: false },
        ...(options.where || []),
      ],
      orderBy: options.orderBy || "bookingDate",
      orderDirection: options.orderDirection || "desc",
    });
  }

  /**
   * Find bookings by professional ID
   * @param {string} professionalId - Professional ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated bookings
   */
  async findByProfessionalId(professionalId, options = {}) {
    return this.findPaginated({
      ...options,
      where: [
        { field: "professionalId", operator: "==", value: professionalId },
        { field: "isDeleted", operator: "==", value: false },
        ...(options.where || []),
      ],
      orderBy: options.orderBy || "bookingDate",
      orderDirection: options.orderDirection || "desc",
    });
  }

  /**
   * Find bookings by status
   * @param {string} status - Booking status
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated bookings
   */
  async findByStatus(status, options = {}) {
    return this.findPaginated({
      ...options,
      where: [
        { field: "status", operator: "==", value: status },
        { field: "isDeleted", operator: "==", value: false },
        ...(options.where || []),
      ],
    });
  }

  /**
   * Find bookings for a specific date
   * @param {string} professionalId - Professional ID
   * @param {Date} date - Booking date
   * @returns {Promise<Array>} Bookings for the date
   */
  async findByDate(professionalId, date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.findAll({
      where: [
        { field: "professionalId", operator: "==", value: professionalId },
        { field: "bookingDate", operator: ">=", value: startOfDay },
        { field: "bookingDate", operator: "<=", value: endOfDay },
        {
          field: "status",
          operator: "in",
          value: [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED],
        },
        { field: "isDeleted", operator: "==", value: false },
      ],
    });
  }

  /**
   * Find bookings in date range
   * @param {string} professionalId - Professional ID
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Array>} Bookings in range
   */
  async findByDateRange(professionalId, startDate, endDate) {
    return this.findAll({
      where: [
        { field: "professionalId", operator: "==", value: professionalId },
        { field: "bookingDate", operator: ">=", value: startDate },
        { field: "bookingDate", operator: "<=", value: endDate },
        {
          field: "status",
          operator: "in",
          value: [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED],
        },
        { field: "isDeleted", operator: "==", value: false },
      ],
      orderBy: "bookingDate",
      orderDirection: "asc",
    });
  }

  /**
   * Find upcoming bookings for a professional
   * @param {string} professionalId - Professional ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated bookings
   */
  async findUpcoming(professionalId, options = {}) {
    const now = new Date();
    return this.findPaginated({
      ...options,
      where: [
        { field: "professionalId", operator: "==", value: professionalId },
        { field: "bookingDate", operator: ">=", value: now },
        { field: "status", operator: "==", value: BOOKING_STATUS.CONFIRMED },
        { field: "isDeleted", operator: "==", value: false },
        ...(options.where || []),
      ],
      orderBy: "bookingDate",
      orderDirection: "asc",
    });
  }

  /**
   * Find past bookings for review
   * @param {string} clientId - Client ID
   * @returns {Promise<Array>} Completed bookings without reviews
   */
  async findCompletedWithoutReview(clientId) {
    return this.findAll({
      where: [
        { field: "clientId", operator: "==", value: clientId },
        { field: "status", operator: "==", value: BOOKING_STATUS.COMPLETED },
        { field: "hasReview", operator: "==", value: false },
        { field: "isDeleted", operator: "==", value: false },
      ],
      orderBy: "completedAt",
      orderDirection: "desc",
    });
  }

  /**
   * Update booking status
   * @param {string} id - Booking ID
   * @param {string} status - New status
   * @param {string} [reason] - Reason for status change
   * @returns {Promise<Object>} Updated booking
   */
  async updateStatus(id, status, reason = null) {
    const updateData = {
      status,
      statusUpdatedAt: this.db.timestamp(),
    };

    if (reason) {
      updateData.statusReason = reason;
    }

    // Set specific timestamps based on status
    switch (status) {
      case BOOKING_STATUS.CONFIRMED:
        updateData.confirmedAt = this.db.timestamp();
        break;
      case BOOKING_STATUS.CANCELLED:
        updateData.cancelledAt = this.db.timestamp();
        break;
      case BOOKING_STATUS.COMPLETED:
        updateData.completedAt = this.db.timestamp();
        break;
      case BOOKING_STATUS.REJECTED:
        updateData.rejectedAt = this.db.timestamp();
        break;
    }

    return this.update(id, updateData);
  }

  /**
   * Check for time slot conflicts
   * @param {string} professionalId - Professional ID
   * @param {Date} bookingDate - Booking date
   * @param {string} startTime - Start time
   * @param {string} endTime - End time
   * @param {string} [excludeBookingId] - Booking ID to exclude
   * @returns {Promise<boolean>} Has conflict
   */
  async hasTimeSlotConflict(
    professionalId,
    bookingDate,
    startTime,
    endTime,
    excludeBookingId = null,
  ) {
    const dayBookings = await this.findByDate(professionalId, bookingDate);

    for (const booking of dayBookings) {
      if (excludeBookingId && booking.id === excludeBookingId) {
        continue;
      }

      // Check for time overlap
      if (
        (startTime >= booking.startTime && startTime < booking.endTime) ||
        (endTime > booking.startTime && endTime <= booking.endTime) ||
        (startTime <= booking.startTime && endTime >= booking.endTime)
      ) {
        return true;
      }
    }

    return false;
  }

  /**
   * Mark booking as having a review
   * @param {string} id - Booking ID
   * @param {string} reviewId - Review ID
   * @returns {Promise<Object>} Updated booking
   */
  async markAsReviewed(id, reviewId) {
    return this.update(id, {
      hasReview: true,
      reviewId,
    });
  }

  /**
   * Get booking count by status for a professional
   * @param {string} professionalId - Professional ID
   * @returns {Promise<Object>} Status counts
   */
  async getStatusCountsForProfessional(professionalId) {
    const statuses = Object.values(BOOKING_STATUS);
    const counts = {};

    for (const status of statuses) {
      counts[status] = await this.count([
        { field: "professionalId", operator: "==", value: professionalId },
        { field: "status", operator: "==", value: status },
        { field: "isDeleted", operator: "==", value: false },
      ]);
    }

    return counts;
  }

  /**
   * Get upcoming bookings that need reminders
   * @param {number} hoursAhead - Hours ahead to look
   * @returns {Promise<Array>} Bookings needing reminders
   */
  async findBookingsNeedingReminder(hoursAhead = 24) {
    const now = new Date();
    const reminderTime = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);

    return this.findAll({
      where: [
        { field: "bookingDate", operator: "<=", value: reminderTime },
        { field: "bookingDate", operator: ">=", value: now },
        { field: "status", operator: "==", value: BOOKING_STATUS.CONFIRMED },
        { field: "reminderSent", operator: "==", value: false },
        { field: "isDeleted", operator: "==", value: false },
      ],
    });
  }

  /**
   * Mark reminder as sent
   * @param {string} id - Booking ID
   * @returns {Promise<Object>} Updated booking
   */
  async markReminderSent(id) {
    return this.update(id, {
      reminderSent: true,
      reminderSentAt: this.db.timestamp(),
    });
  }

  /**
   * Get booking statistics
   * @param {Object} filters - Optional filters
   * @returns {Promise<Object>} Booking statistics
   */
  async getStatistics(filters = {}) {
    const baseWhere = [{ field: "isDeleted", operator: "==", value: false }];

    if (filters.professionalId) {
      baseWhere.push({
        field: "professionalId",
        operator: "==",
        value: filters.professionalId,
      });
    }

    if (filters.clientId) {
      baseWhere.push({
        field: "clientId",
        operator: "==",
        value: filters.clientId,
      });
    }

    const statusCounts = {};
    for (const status of Object.values(BOOKING_STATUS)) {
      statusCounts[status] = await this.count([
        ...baseWhere,
        { field: "status", operator: "==", value: status },
      ]);
    }

    const total = await this.count(baseWhere);

    return {
      total,
      byStatus: statusCounts,
    };
  }
}

export default new BookingRepository();
