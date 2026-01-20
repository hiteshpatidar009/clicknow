/**
 * Review Model
 * Defines review data structure
 */

import { REVIEW_STATUS } from "../utils/constants.util.js";

class ReviewModel {
  constructor(data = {}) {
    this.id = data.id || null;
    this.bookingId = data.bookingId || null;
    this.clientId = data.clientId || null;
    this.professionalId = data.professionalId || null;
    this.rating = data.rating || 0;
    this.title = data.title || "";
    this.content = data.content || "";
    this.response = data.response || null; // Professional's response
    this.responseAt = data.responseAt || null;
    this.status = data.status || REVIEW_STATUS.PENDING;
    this.moderationReason = data.moderationReason || null;
    this.isReported = data.isReported || false;
    this.reportedAt = data.reportedAt || null;
    this.reportedBy = data.reportedBy || null;
    this.reportReason = data.reportReason || null;
    this.helpfulCount = data.helpfulCount || 0;
    this.helpfulVotes = data.helpfulVotes || [];
    this.isDeleted = data.isDeleted || false;
    this.statusUpdatedAt = data.statusUpdatedAt || null;
    this.createdAt = data.createdAt || null;
    this.updatedAt = data.updatedAt || null;
  }

  /**
   * Validate rating
   */
  isValidRating() {
    return this.rating >= 1 && this.rating <= 5;
  }

  /**
   * Check if review is approved
   */
  isApproved() {
    return this.status === REVIEW_STATUS.APPROVED;
  }

  /**
   * Check if review is pending
   */
  isPending() {
    return this.status === REVIEW_STATUS.PENDING;
  }

  /**
   * Check if review is rejected
   */
  isRejected() {
    return this.status === REVIEW_STATUS.REJECTED;
  }

  /**
   * Check if review has response
   */
  hasResponse() {
    return !!this.response;
  }

  /**
   * Check if user has voted helpful
   */
  hasUserVotedHelpful(userId) {
    return this.helpfulVotes.includes(userId);
  }

  /**
   * Add helpful vote
   */
  addHelpfulVote(userId) {
    if (!this.hasUserVotedHelpful(userId)) {
      this.helpfulVotes.push(userId);
      this.helpfulCount++;
      return true;
    }
    return false;
  }

  /**
   * Remove helpful vote
   */
  removeHelpfulVote(userId) {
    const index = this.helpfulVotes.indexOf(userId);
    if (index > -1) {
      this.helpfulVotes.splice(index, 1);
      this.helpfulCount = Math.max(0, this.helpfulCount - 1);
      return true;
    }
    return false;
  }

  /**
   * Add professional response
   */
  addResponse(responseText) {
    this.response = {
      text: responseText,
      createdAt: new Date().toISOString(),
    };
    this.responseAt = new Date().toISOString();
  }

  /**
   * Get rating label
   */
  getRatingLabel() {
    const labels = {
      1: "Poor",
      2: "Fair",
      3: "Good",
      4: "Very Good",
      5: "Excellent",
    };
    return labels[this.rating] || "Unknown";
  }

  /**
   * Convert to plain object for database storage
   */
  toJSON() {
    return {
      id: this.id,
      bookingId: this.bookingId,
      clientId: this.clientId,
      professionalId: this.professionalId,
      rating: this.rating,
      title: this.title,
      content: this.content,
      response: this.response,
      responseAt: this.responseAt,
      status: this.status,
      moderationReason: this.moderationReason,
      isReported: this.isReported,
      reportedAt: this.reportedAt,
      reportedBy: this.reportedBy,
      reportReason: this.reportReason,
      helpfulCount: this.helpfulCount,
      helpfulVotes: this.helpfulVotes,
      isDeleted: this.isDeleted,
      statusUpdatedAt: this.statusUpdatedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Convert to public view
   */
  toPublicView() {
    return {
      id: this.id,
      rating: this.rating,
      title: this.title,
      content: this.content,
      response: this.response,
      helpfulCount: this.helpfulCount,
      createdAt: this.createdAt,
    };
  }

  /**
   * Create ReviewModel from database document
   */
  static fromDocument(doc) {
    return new ReviewModel(doc);
  }

  /**
   * Create ReviewModel for new review
   */
  static forNewReview(data) {
    return new ReviewModel({
      ...data,
      status: REVIEW_STATUS.PENDING, // Auto-approve can be set based on settings
      helpfulCount: 0,
      helpfulVotes: [],
      isReported: false,
      isDeleted: false,
    });
  }
}

export default ReviewModel;
