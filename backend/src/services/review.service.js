/**
 * Review Service
 */

import {
  reviewRepository,
  bookingRepository,
  professionalRepository,
} from "../repositories/index.js";
import { ReviewModel } from "../models/index.js";
import notificationService from "./notification.service.js";
import Logger from "../utils/logger.util.js";
import { REVIEW_STATUS } from "../utils/constants.util.js";

class ReviewService {
  async createReview(clientId, reviewData) {
    const { bookingId, professionalId, rating, comment } = reviewData;

    const booking = await bookingRepository.findById(bookingId);
    if (!booking || booking.clientId !== clientId) {
      throw new Error("Invalid booking");
    }

    const existingReview = await reviewRepository.findByBooking(bookingId);
    if (existingReview) throw new Error("Review already exists");

    const reviewModel = new ReviewModel({
      bookingId,
      professionalId,
      clientId,
      rating,
      comment,
      status: REVIEW_STATUS.APPROVED,
    });

    const review = await reviewRepository.create(reviewModel.toJSON());

    await professionalRepository.updateRating(professionalId);

    const professional = await professionalRepository.findById(professionalId);
    await notificationService.sendNotification(professional.userId, {
      type: "review",
      title: "New Review",
      body: `You received a ${rating}-star review`,
      data: { reviewId: review.id, action: "new_review" },
      channels: ["push"],
    });

    Logger.logBusinessEvent("review_created", {
      reviewId: review.id,
      professionalId,
      rating,
    });

    return review;
  }

  async getById(reviewId) {
    return reviewRepository.findById(reviewId);
  }

  async getProfessionalReviews(professionalId, options = {}) {
    return reviewRepository.findByProfessionalId(professionalId, options);
  }

  async getClientReviews(clientId, options = {}) {
    return reviewRepository.findByClientId(clientId, options);
  }

  async addResponse(reviewId, professionalUserId, response) {
    const review = await reviewRepository.findById(reviewId);
    if (!review) throw new Error("Review not found");

    const professional = await professionalRepository.findByUserId(
      professionalUserId
    );
    if (review.professionalId !== professional.id) {
      throw new Error("Unauthorized");
    }

    return reviewRepository.update(reviewId, {
      professionalResponse: response,
      respondedAt: new Date(),
    });
  }

  async reportReview(reviewId, userId, reason) {
    return reviewRepository.update(reviewId, {
      status: REVIEW_STATUS.REPORTED,
      reportedBy: userId,
      reportReason: reason,
      reportedAt: new Date(),
    });
  }

  async markHelpful(reviewId, userId) {
    return reviewRepository.addHelpful(reviewId, userId);
  }

  async getPendingReviews(options = {}) {
    return reviewRepository.findPending(options);
  }

  async getReportedReviews(options = {}) {
    return reviewRepository.findReported(options);
  }

  async approveReview(reviewId, adminId) {
    return reviewRepository.update(reviewId, {
      status: REVIEW_STATUS.APPROVED,
      approvedBy: adminId,
      approvedAt: new Date(),
    });
  }

  async rejectReview(reviewId, adminId, reason) {
    return reviewRepository.update(reviewId, {
      status: REVIEW_STATUS.REJECTED,
      rejectedBy: adminId,
      rejectionReason: reason,
      rejectedAt: new Date(),
    });
  }

  async removeReview(reviewId, adminId, reason) {
    return reviewRepository.softDelete(reviewId);
  }

  async getStatistics() {
    return reviewRepository.getStatistics();
  }
}

export default new ReviewService();
