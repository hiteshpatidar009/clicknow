/**
 * Review Service
 * Business logic for reviews
 */

import {
  reviewRepository,
  bookingRepository,
  professionalRepository,
} from "../repositories/index.js";
import { ReviewModel } from "../models/index.js";
import notificationService from "./notification.service.js";
import Logger from "../utils/logger.util.js";
import { BOOKING_STATUS, REVIEW_STATUS } from "../utils/constants.util.js";
import {
  ReviewNotFoundError,
  ReviewAlreadyExistsError,
  ReviewNotAllowedError,
  BookingNotFoundError,
} from "../utils/errors.util.js";

class ReviewService {
  /**
   * Create a review
   */
  async createReview(clientId, reviewData) {
    const { bookingId, rating, title, content } = reviewData;

    // Get booking
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) {
      throw new BookingNotFoundError();
    }

    // Verify client owns the booking
    if (booking.clientId !== clientId) {
      throw new ReviewNotAllowedError();
    }

    // Check booking is completed
    if (booking.status !== BOOKING_STATUS.COMPLETED) {
      throw new ReviewNotAllowedError();
    }

    // Check if already reviewed
    const existingReview = await reviewRepository.findByBookingId(bookingId);
    if (existingReview) {
      throw new ReviewAlreadyExistsError();
    }

    // Create review
    const reviewModel = ReviewModel.forNewReview({
      bookingId,
      clientId,
      professionalId: booking.professionalId,
      rating,
      title,
      content,
      status: REVIEW_STATUS.APPROVED, // Auto-approve, or set to PENDING for moderation
    });

    const review = await reviewRepository.create(reviewModel.toJSON());

    // Mark booking as reviewed
    await bookingRepository.markAsReviewed(bookingId, review.id);

    // Update professional rating stats
    await this.updateProfessionalRating(booking.professionalId);

    // Notify professional
    const professional = await professionalRepository.findById(
      booking.professionalId,
    );
    if (professional) {
      await notificationService.sendNewReviewNotification(professional.userId, {
        reviewId: review.id,
        rating,
      });
    }

    Logger.logBusinessEvent("review_created", {
      reviewId: review.id,
      bookingId,
      professionalId: booking.professionalId,
      rating,
    });

    return review;
  }

  /**
   * Get review by ID
   */
  async getById(reviewId) {
    const review = await reviewRepository.findById(reviewId);
    if (!review) {
      throw new ReviewNotFoundError();
    }
    return review;
  }

  /**
   * Get reviews for professional
   */
  async getProfessionalReviews(professionalId, options = {}) {
    const result = await reviewRepository.findByProfessionalId(professionalId, {
      page: options.page || 1,
      pageSize: options.pageSize || 20,
    });

    return {
      data: result.data.map((r) => ReviewModel.fromDocument(r).toPublicView()),
      pagination: result.pagination,
    };
  }

  /**
   * Get reviews by client
   */
  async getClientReviews(clientId, options = {}) {
    return reviewRepository.findByClientId(clientId, options);
  }

  /**
   * Add professional response to review
   */
  async addResponse(reviewId, professionalUserId, responseText) {
    const review = await reviewRepository.findById(reviewId);
    if (!review) {
      throw new ReviewNotFoundError();
    }

    // Verify professional owns this review
    const professional = await professionalRepository.findById(
      review.professionalId,
    );
    if (!professional || professional.userId !== professionalUserId) {
      throw new Error("Unauthorized to respond to this review");
    }

    if (review.response) {
      throw new Error("Review already has a response");
    }

    const updated = await reviewRepository.update(reviewId, {
      response: {
        text: responseText,
        createdAt: new Date().toISOString(),
      },
      responseAt: new Date(),
    });

    Logger.logBusinessEvent("review_response_added", { reviewId });

    return updated;
  }

  /**
   * Report a review
   */
  async reportReview(reviewId, reporterId, reason) {
    const review = await reviewRepository.findById(reviewId);
    if (!review) {
      throw new ReviewNotFoundError();
    }

    const updated = await reviewRepository.reportReview(
      reviewId,
      reporterId,
      reason,
    );

    Logger.logBusinessEvent("review_reported", {
      reviewId,
      reporterId,
      reason,
    });

    return updated;
  }

  /**
   * Mark review as helpful
   */
  async markHelpful(reviewId, userId) {
    const review = await reviewRepository.findById(reviewId);
    if (!review) {
      throw new ReviewNotFoundError();
    }

    if (review.helpfulVotes?.includes(userId)) {
      // Remove vote
      return reviewRepository.removeHelpfulVote(reviewId, userId);
    } else {
      // Add vote
      return reviewRepository.markHelpful(reviewId, userId);
    }
  }

  /**
   * Approve review (admin)
   */
  async approveReview(reviewId, adminId) {
    const review = await reviewRepository.findById(reviewId);
    if (!review) {
      throw new ReviewNotFoundError();
    }

    const updated = await reviewRepository.updateStatus(
      reviewId,
      REVIEW_STATUS.APPROVED,
    );

    // Update professional rating
    await this.updateProfessionalRating(review.professionalId);

    Logger.logBusinessEvent("review_approved", { reviewId, adminId });

    return updated;
  }

  /**
   * Reject review (admin)
   */
  async rejectReview(reviewId, adminId, reason) {
    const review = await reviewRepository.findById(reviewId);
    if (!review) {
      throw new ReviewNotFoundError();
    }

    const updated = await reviewRepository.updateStatus(
      reviewId,
      REVIEW_STATUS.REJECTED,
      reason,
    );

    Logger.logBusinessEvent("review_rejected", { reviewId, adminId, reason });

    return updated;
  }

  /**
   * Remove review (admin)
   */
  async removeReview(reviewId, adminId, reason) {
    const review = await reviewRepository.findById(reviewId);
    if (!review) {
      throw new ReviewNotFoundError();
    }

    const updated = await reviewRepository.updateStatus(
      reviewId,
      REVIEW_STATUS.REMOVED,
      reason,
    );

    // Update professional rating
    await this.updateProfessionalRating(review.professionalId);

    Logger.logBusinessEvent("review_removed", { reviewId, adminId, reason });

    return updated;
  }

  /**
   * Get pending reviews (admin)
   */
  async getPendingReviews(options = {}) {
    return reviewRepository.findPendingModeration(options);
  }

  /**
   * Get reported reviews (admin)
   */
  async getReportedReviews(options = {}) {
    return reviewRepository.findReported(options);
  }

  /**
   * Get rating statistics for professional
   */
  async getRatingStats(professionalId) {
    return reviewRepository.getRatingStats(professionalId);
  }

  /**
   * Update professional's rating stats
   */
  async updateProfessionalRating(professionalId) {
    const stats = await reviewRepository.getRatingStats(professionalId);

    await professionalRepository.updateRatingStats(
      professionalId,
      stats.averageRating,
      stats.totalReviews,
    );

    return stats;
  }

  /**
   * Get recent reviews for professional
   */
  async getRecentReviews(professionalId, limit = 5) {
    const reviews = await reviewRepository.getRecentReviews(
      professionalId,
      limit,
    );
    return reviews.map((r) => ReviewModel.fromDocument(r).toPublicView());
  }

  /**
   * Get review statistics (admin)
   */
  async getStatistics() {
    return reviewRepository.getStatistics();
  }
}

export default new ReviewService();
