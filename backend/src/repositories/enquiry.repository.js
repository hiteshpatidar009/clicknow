/**
 * Enquiry Repository
 * Data access layer for client enquiry forms
 */

import BaseRepository from "./base.repository.js";
import { COLLECTIONS, ENQUIRY_STATUS } from "../utils/constants.util.js";

class EnquiryRepository extends BaseRepository {
  constructor() {
    super(COLLECTIONS.ENQUIRIES);
  }

  /**
   * Find enquiries by client ID
   * @param {string} clientId - Client user ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated enquiries
   */
  async findByClientId(clientId, options = {}) {
    return this.findPaginated({
      ...options,
      where: [
        { field: "clientId", operator: "==", value: clientId },
        { field: "isDeleted", operator: "==", value: false },
        ...(options.where || []),
      ],
      orderBy: "createdAt",
      orderDirection: "desc",
    });
  }

  /**
   * Find enquiries for a professional
   * @param {string} professionalId - Professional ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated enquiries
   */
  async findByProfessionalId(professionalId, options = {}) {
    return this.findPaginated({
      ...options,
      where: [
        { field: "professionalId", operator: "==", value: professionalId },
        { field: "isDeleted", operator: "==", value: false },
        ...(options.where || []),
      ],
      orderBy: "createdAt",
      orderDirection: "desc",
    });
  }

  /**
   * Find pending enquiries for a professional
   * @param {string} professionalId - Professional ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated enquiries
   */
  async findPendingByProfessionalId(professionalId, options = {}) {
    return this.findPaginated({
      ...options,
      where: [
        { field: "professionalId", operator: "==", value: professionalId },
        { field: "status", operator: "==", value: ENQUIRY_STATUS.PENDING },
        { field: "isDeleted", operator: "==", value: false },
        ...(options.where || []),
      ],
      orderBy: "createdAt",
      orderDirection: "asc",
    });
  }

  /**
   * Find enquiries by status
   * @param {string} status - Enquiry status
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated enquiries
   */
  async findByStatus(status, options = {}) {
    return this.findPaginated({
      ...options,
      where: [
        { field: "status", operator: "==", value: status },
        { field: "isDeleted", operator: "==", value: false },
        ...(options.where || []),
      ],
      orderBy: "createdAt",
      orderDirection: "desc",
    });
  }

  /**
   * Update enquiry status
   * @param {string} id - Enquiry ID
   * @param {string} status - New status
   * @param {string} [note] - Status note
   * @returns {Promise<Object>} Updated enquiry
   */
  async updateStatus(id, status, note = null) {
    const updateData = {
      status,
      statusUpdatedAt: this.db.timestamp(),
    };

    if (note) {
      updateData.statusNote = note;
    }

    switch (status) {
      case ENQUIRY_STATUS.RESPONDED:
        updateData.respondedAt = this.db.timestamp();
        break;
      case ENQUIRY_STATUS.CONVERTED:
        updateData.convertedAt = this.db.timestamp();
        break;
      case ENQUIRY_STATUS.CLOSED:
        updateData.closedAt = this.db.timestamp();
        break;
    }

    return this.update(id, updateData);
  }

  /**
   * Mark enquiry as converted to booking
   * @param {string} id - Enquiry ID
   * @param {string} bookingId - Created booking ID
   * @returns {Promise<Object>} Updated enquiry
   */
  async convertToBooking(id, bookingId) {
    return this.update(id, {
      status: ENQUIRY_STATUS.CONVERTED,
      bookingId,
      convertedAt: this.db.timestamp(),
    });
  }

  /**
   * Check if client has pending enquiry for professional
   * @param {string} clientId - Client ID
   * @param {string} professionalId - Professional ID
   * @returns {Promise<boolean>} Has pending enquiry
   */
  async hasPendingEnquiry(clientId, professionalId) {
    const count = await this.count([
      { field: "clientId", operator: "==", value: clientId },
      { field: "professionalId", operator: "==", value: professionalId },
      { field: "status", operator: "==", value: ENQUIRY_STATUS.PENDING },
      { field: "isDeleted", operator: "==", value: false },
    ]);
    return count > 0;
  }

  /**
   * Get enquiry statistics
   * @param {Object} filters - Optional filters
   * @returns {Promise<Object>} Enquiry statistics
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
    for (const status of Object.values(ENQUIRY_STATUS)) {
      statusCounts[status] = await this.count([
        ...baseWhere,
        { field: "status", operator: "==", value: status },
      ]);
    }

    const total = await this.count(baseWhere);

    return {
      total,
      byStatus: statusCounts,
      conversionRate:
        total > 0 ? Math.round((statusCounts.converted / total) * 100) : 0,
    };
  }
}

export default new EnquiryRepository();
