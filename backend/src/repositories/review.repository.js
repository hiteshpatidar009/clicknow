/**
 * Review Repository
 */

import BaseRepository from "./base.repository.js";
import { COLLECTIONS } from "../utils/constants.util.js";

class ReviewRepository extends BaseRepository {
  constructor() {
    super(COLLECTIONS.REVIEWS);
  }

  async findByProfessionalId(professionalId, options = {}) {
    return this.findPaginated({
      ...options,
      where: [
        { field: "professionalId", operator: "==", value: professionalId },
        { field: "status", operator: "==", value: "approved" },
      ],
      orderBy: "createdAt",
      orderDirection: "desc",
    });
  }

  async findByClientId(clientId, options = {}) {
    return this.findPaginated({
      ...options,
      where: [{ field: "clientId", operator: "==", value: clientId }],
      orderBy: "createdAt",
      orderDirection: "desc",
    });
  }

  async findByBooking(bookingId) {
    return this.findByField("bookingId", bookingId);
  }

  async findPending(options = {}) {
    return this.findPaginated({
      ...options,
      where: [{ field: "status", operator: "==", value: "pending" }],
      orderBy: "createdAt",
      orderDirection: "desc",
    });
  }

  async findReported(options = {}) {
    return this.findPaginated({
      ...options,
      where: [{ field: "status", operator: "==", value: "reported" }],
      orderBy: "reportedAt",
      orderDirection: "desc",
    });
  }

  async addHelpful(reviewId, userId) {
    await this.addToArray(reviewId, "helpfulBy", userId);
    return this.incrementField(reviewId, "helpfulCount", 1);
  }

  async getStatistics() {
    const [total, pending, reported] = await Promise.all([
      this.count([]),
      this.count([{ field: "status", operator: "==", value: "pending" }]),
      this.count([{ field: "status", operator: "==", value: "reported" }]),
    ]);

    return { total, pending, reported };
  }
}

export default new ReviewRepository();
