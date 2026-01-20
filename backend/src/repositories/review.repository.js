/**
 * Review Repository
 * Data access layer for review documents
 */

import BaseRepository from "./base.repository.js";
import { COLLECTIONS } from "../utils/constants.util.js";

class ReviewRepository extends BaseRepository {
  constructor() {
    super(COLLECTIONS.REVIEWS);
  }

  /**
   * Find reviews by professional ID
   * @param {string} professionalId - Professional ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated reviews
   */
  async findByProfessionalId(professionalId, options = {}) {
    return this.findPaginated({
      ...options,
      where: [
        { field: "professionalId", operator: "==", value: professionalId },
        { field: "status", operator: "==", value: "approved" },
        { field: "isDeleted", operator: "==", value: false },
        ...(options.where || []),
      ],
      orderBy: options.orderBy || "createdAt",
      orderDirection: options.orderDirection || "desc",
    });
  }

  /**
   * Find reviews by client ID
   * @param {string} clientId - Client user ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated reviews
   */
  async findByClientId(clientId, options = {}) {
    return this.findPaginated({
      ...options,
      where: [
        { field: "clientId", operator: "==", value: clientId },
        { field: "isDeleted", operator: "==", value: false },
        ...(options.where || []),
      ],
      orderBy: options.orderBy || "createdAt",
      orderDirection: options.orderDirection || "desc",
    });
  }

  /**
   * Find review by booking ID
   * @param {string} bookingId - Booking ID
   * @returns {Promise<Object|null>} Review document
   */
  async findByBookingId(bookingId) {
    return this.findByField("bookingId", bookingId);
  }

  /**
   * Check if client has reviewed a booking
   * @param {string} clientId - Client ID
   * @param {string} bookingId - Booking ID
   * @returns {Promise<boolean>} Has reviewed
   */
  async hasClientReviewedBooking(clientId, bookingId) {
    const count = await this.count([
      { field: "clientId", operator: "==", value: clientId },
      { field: "bookingId", operator: "==", value: bookingId },
      { field: "isDeleted", operator: "==", value: false },
    ]);
    return count > 0;
  }

  /**
   * Find pending reviews (for moderation)
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated reviews
   */
  async findPendingModeration(options = {}) {
    return this.findPaginated({
      ...options,
      where: [
        { field: "status", operator: "==", value: "pending" },
        { field: "isDeleted", operator: "==", value: false },
        ...(options.where || []),
      ],
      orderBy: "createdAt",
      orderDirection: "asc",
    });
  }

  /**
   * Find reported reviews
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated reviews
   */
  async findReported(options = {}) {
    return this.findPaginated({
      ...options,
      where: [
        { field: "isReported", operator: "==", value: true },
        { field: "status", operator: "!=", value: "removed" },
        { field: "isDeleted", operator: "==", value: false },
        ...(options.where || []),
      ],
      orderBy: "reportedAt",
      orderDirection: "asc",
    });
  }

  /**
   * Update review status
   * @param {string} id - Review ID
   * @param {string} status - New status (pending, approved, rejected, removed)
   * @param {string} [reason] - Reason for status change
   * @returns {Promise<Object>} Updated review
   */
  async updateStatus(id, status, reason = null) {
    const updateData = {
      status,
      statusUpdatedAt: this.db.timestamp(),
    };

    if (reason) {
      updateData.moderationReason = reason;
    }

    return this.update(id, updateData);
  }

  /**
   * Report a review
   * @param {string} id - Review ID
   * @param {string} reporterId - Reporter user ID
   * @param {string} reason - Report reason
   * @returns {Promise<Object>} Updated review
   */
  async reportReview(id, reporterId, reason) {
    return this.update(id, {
      isReported: true,
      reportedAt: this.db.timestamp(),
      reportedBy: reporterId,
      reportReason: reason,
    });
  }

  /**
   * Get average rating for a professional
   * @param {string} professionalId - Professional ID
   * @returns {Promise<Object>} Rating statistics
   */
  async getRatingStats(professionalId) {
    const reviews = await this.findAll({
      where: [
        { field: "professionalId", operator: "==", value: professionalId },
        { field: "status", operator: "==", value: "approved" },
        { field: "isDeleted", operator: "==", value: false },
      ],
    });

    if (reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalRating = 0;

    for (const review of reviews) {
      totalRating += review.rating;
      ratingDistribution[review.rating] =
        (ratingDistribution[review.rating] || 0) + 1;
    }

    return {
      averageRating: Math.round((totalRating / reviews.length) * 10) / 10,
      totalReviews: reviews.length,
      ratingDistribution,
    };
  }

  /**
   * Get recent reviews for a professional
   * @param {string} professionalId - Professional ID
   * @param {number} limit - Number of reviews
   * @returns {Promise<Array>} Recent reviews
   */
  async getRecentReviews(professionalId, limit = 5) {
    return this.findAll({
      where: [
        { field: "professionalId", operator: "==", value: professionalId },
        { field: "status", operator: "==", value: "approved" },
        { field: "isDeleted", operator: "==", value: false },
      ],
      orderBy: "createdAt",
      orderDirection: "desc",
      limit,
    });
  }

  /**
   * Mark review as helpful
   * @param {string} id - Review ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Updated review
   */
  async markHelpful(id, userId) {
    await this.addToArray(id, "helpfulVotes", userId);
    return this.incrementField(id, "helpfulCount");
  }

  /**
   * Remove helpful vote
   * @param {string} id - Review ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Updated review
   */
  async removeHelpfulVote(id, userId) {
    await this.removeFromArray(id, "helpfulVotes", userId);
    return this.incrementField(id, "helpfulCount", -1);
  }

  /**
   * Get review statistics
   * @returns {Promise<Object>} Review statistics
   */
  async getStatistics() {
    const [total, approved, pending, reported] = await Promise.all([
      this.count([{ field: "isDeleted", operator: "==", value: false }]),
      this.count([
        { field: "status", operator: "==", value: "approved" },
        { field: "isDeleted", operator: "==", value: false },
      ]),
      this.count([
        { field: "status", operator: "==", value: "pending" },
        { field: "isDeleted", operator: "==", value: false },
      ]),
      this.count([
        { field: "isReported", operator: "==", value: true },
        { field: "isDeleted", operator: "==", value: false },
      ]),
    ]);

    return {
      total,
      approved,
      pending,
      reported,
    };
  }
}

export default new ReviewRepository();
