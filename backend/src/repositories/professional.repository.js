/**
 * Professional Repository
 * Data access layer for professional (photographer/musician/etc.) profiles
 */

import BaseRepository from "./base.repository.js";
import { COLLECTIONS } from "../utils/constants.util.js";

class ProfessionalRepository extends BaseRepository {
  constructor() {
    super(COLLECTIONS.PROFESSIONALS);
  }

  /**
   * Find professional by user ID
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} Professional document
   */
  async findByUserId(userId) {
    return this.findByField("userId", userId);
  }

  /**
   * Find professionals by category
   * @param {string} category - Professional category
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated professionals
   */
  async findByCategory(category, options = {}) {
    return this.findPaginated({
      ...options,
      where: [
        { field: "category", operator: "==", value: category },
        { field: "status", operator: "==", value: "approved" },
        { field: "isActive", operator: "==", value: true },
        { field: "isDeleted", operator: "==", value: false },
        ...(options.where || []),
      ],
    });
  }

  /**
   * Find professionals by specialty
   * @param {string} specialty - Specialty
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated professionals
   */
  async findBySpecialty(specialty, options = {}) {
    return this.findPaginated({
      ...options,
      where: [
        { field: "specialties", operator: "array-contains", value: specialty },
        { field: "status", operator: "==", value: "approved" },
        { field: "isActive", operator: "==", value: true },
        { field: "isDeleted", operator: "==", value: false },
        ...(options.where || []),
      ],
    });
  }

  /**
   * Find professionals by location
   * @param {string} city - City name
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated professionals
   */
  async findByCity(city, options = {}) {
    return this.findPaginated({
      ...options,
      where: [
        { field: "location.city", operator: "==", value: city.toLowerCase() },
        { field: "status", operator: "==", value: "approved" },
        { field: "isActive", operator: "==", value: true },
        { field: "isDeleted", operator: "==", value: false },
        ...(options.where || []),
      ],
    });
  }

  /**
   * Find professionals by service areas
   * @param {string} area - Service area
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated professionals
   */
  async findByServiceArea(area, options = {}) {
    return this.findPaginated({
      ...options,
      where: [
        {
          field: "serviceAreas",
          operator: "array-contains",
          value: area.toLowerCase(),
        },
        { field: "status", operator: "==", value: "approved" },
        { field: "isActive", operator: "==", value: true },
        { field: "isDeleted", operator: "==", value: false },
        ...(options.where || []),
      ],
    });
  }

  /**
   * Find featured professionals
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated professionals
   */
  async findFeatured(options = {}) {
    return this.findPaginated({
      ...options,
      where: [
        { field: "isFeatured", operator: "==", value: true },
        { field: "status", operator: "==", value: "approved" },
        { field: "isActive", operator: "==", value: true },
        { field: "isDeleted", operator: "==", value: false },
        ...(options.where || []),
      ],
      orderBy: "featuredOrder",
      orderDirection: "asc",
    });
  }

  /**
   * Find professionals pending approval
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated professionals
   */
  async findPendingApproval(options = {}) {
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
   * Find top rated professionals
   * @param {number} limit - Number of professionals
   * @returns {Promise<Array>} Professional documents
   */
  async findTopRated(limit = 10) {
    return this.findAll({
      where: [
        { field: "status", operator: "==", value: "approved" },
        { field: "isActive", operator: "==", value: true },
        { field: "isDeleted", operator: "==", value: false },
        { field: "stats.totalReviews", operator: ">=", value: 1 },
      ],
      orderBy: "stats.averageRating",
      orderDirection: "desc",
      limit,
    });
  }

  /**
   * Update professional status
   * @param {string} id - Professional ID
   * @param {string} status - New status
   * @param {string} [reason] - Reason for status change
   * @returns {Promise<Object>} Updated professional
   */
  async updateStatus(id, status, reason = null) {
    const updateData = {
      status,
      statusUpdatedAt: this.db.timestamp(),
    };

    if (reason) {
      updateData.statusReason = reason;
    }

    if (status === "approved") {
      updateData.approvedAt = this.db.timestamp();
    } else if (status === "rejected") {
      updateData.rejectedAt = this.db.timestamp();
    }

    return this.update(id, updateData);
  }

  /**
   * Update professional verification
   * @param {string} id - Professional ID
   * @param {boolean} isVerified - Verification status
   * @returns {Promise<Object>} Updated professional
   */
  async updateVerification(id, isVerified) {
    return this.update(id, {
      isVerified,
      verifiedAt: isVerified ? this.db.timestamp() : null,
    });
  }

  /**
   * Set featured status
   * @param {string} id - Professional ID
   * @param {boolean} isFeatured - Featured status
   * @param {number} [order] - Featured order
   * @returns {Promise<Object>} Updated professional
   */
  async setFeatured(id, isFeatured, order = null) {
    const updateData = { isFeatured };
    if (order !== null) {
      updateData.featuredOrder = order;
    }
    return this.update(id, updateData);
  }

  /**
   * Update professional stats
   * @param {string} id - Professional ID
   * @param {Object} stats - Stats to update
   * @returns {Promise<Object>} Updated professional
   */
  async updateStats(id, stats) {
    const updateData = {};

    for (const [key, value] of Object.entries(stats)) {
      updateData[`stats.${key}`] = value;
    }

    return this.update(id, updateData);
  }

  /**
   * Increment booking count
   * @param {string} id - Professional ID
   * @returns {Promise<Object>} Updated professional
   */
  async incrementBookingCount(id) {
    return this.incrementField(id, "stats.totalBookings");
  }

  /**
   * Update rating stats
   * @param {string} id - Professional ID
   * @param {number} averageRating - New average rating
   * @param {number} totalReviews - Total reviews count
   * @returns {Promise<Object>} Updated professional
   */
  async updateRatingStats(id, averageRating, totalReviews) {
    return this.update(id, {
      "stats.averageRating": averageRating,
      "stats.totalReviews": totalReviews,
    });
  }

  /**
   * Add portfolio item
   * @param {string} id - Professional ID
   * @param {Object} portfolioItem - Portfolio item data
   * @returns {Promise<Object>} Updated professional
   */
  async addPortfolioItem(id, portfolioItem) {
    return this.addToArray(id, "portfolio", portfolioItem);
  }

  /**
   * Remove portfolio item
   * @param {string} id - Professional ID
   * @param {Object} portfolioItem - Portfolio item to remove
   * @returns {Promise<Object>} Updated professional
   */
  async removePortfolioItem(id, portfolioItem) {
    return this.removeFromArray(id, "portfolio", portfolioItem);
  }

  /**
   * Search professionals with multiple filters
   * @param {Object} filters - Search filters
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated professionals
   */
  async search(filters, options = {}) {
    const whereConditions = [
      { field: "status", operator: "==", value: "approved" },
      { field: "isActive", operator: "==", value: true },
      { field: "isDeleted", operator: "==", value: false },
    ];

    if (filters.category) {
      whereConditions.push({
        field: "category",
        operator: "==",
        value: filters.category,
      });
    }

    if (filters.city) {
      whereConditions.push({
        field: "location.city",
        operator: "==",
        value: filters.city.toLowerCase(),
      });
    }

    if (filters.minRating) {
      whereConditions.push({
        field: "stats.averageRating",
        operator: ">=",
        value: filters.minRating,
      });
    }

    if (filters.maxPrice) {
      whereConditions.push({
        field: "pricing.hourlyRate",
        operator: "<=",
        value: filters.maxPrice,
      });
    }

    if (filters.minPrice) {
      whereConditions.push({
        field: "pricing.hourlyRate",
        operator: ">=",
        value: filters.minPrice,
      });
    }

    return this.findPaginated({
      ...options,
      where: whereConditions,
    });
  }

  /**
   * Get category statistics
   * @returns {Promise<Object>} Category statistics
   */
  async getCategoryStats() {
    const categories = [
      "photographer",
      "musician",
      "guitarist",
      "magician",
      "other",
    ];
    const stats = {};

    for (const category of categories) {
      stats[category] = await this.count([
        { field: "category", operator: "==", value: category },
        { field: "status", operator: "==", value: "approved" },
        { field: "isDeleted", operator: "==", value: false },
      ]);
    }

    return stats;
  }

  /**
   * Get overall statistics
   * @returns {Promise<Object>} Professional statistics
   */
  async getStatistics() {
    const [total, approved, pending, rejected, featured] = await Promise.all([
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
        { field: "status", operator: "==", value: "rejected" },
        { field: "isDeleted", operator: "==", value: false },
      ]),
      this.count([
        { field: "isFeatured", operator: "==", value: true },
        { field: "isDeleted", operator: "==", value: false },
      ]),
    ]);

    const categoryStats = await this.getCategoryStats();

    return {
      total,
      approved,
      pending,
      rejected,
      featured,
      byCategory: categoryStats,
    };
  }
}

export default new ProfessionalRepository();
