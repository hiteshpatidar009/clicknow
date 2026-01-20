/**
 * User Repository
 * Data access layer for user documents
 */

import BaseRepository from "./base.repository.js";
import { COLLECTIONS } from "../utils/constants.util.js";

class UserRepository extends BaseRepository {
  constructor() {
    super(COLLECTIONS.USERS);
  }

  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Promise<Object|null>} User document
   */
  async findByEmail(email) {
    return this.findByField("email", email.toLowerCase());
  }

  /**
   * Find user by phone number
   * @param {string} phone - Phone number
   * @returns {Promise<Object|null>} User document
   */
  async findByPhone(phone) {
    return this.findByField("phone", phone);
  }

  /**
   * Find user by Firebase UID
   * @param {string} firebaseUid - Firebase Auth UID
   * @returns {Promise<Object|null>} User document
   */
  async findByFirebaseUid(firebaseUid) {
    return this.findByField("firebaseUid", firebaseUid);
  }

  /**
   * Find users by role
   * @param {string} role - User role
   * @param {Object} options - Query options
   * @returns {Promise<Array>} User documents
   */
  async findByRole(role, options = {}) {
    return this.findPaginated({
      ...options,
      where: [
        { field: "role", operator: "==", value: role },
        { field: "isDeleted", operator: "==", value: false },
        ...(options.where || []),
      ],
    });
  }

  /**
   * Find active users
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated users
   */
  async findActiveUsers(options = {}) {
    return this.findPaginated({
      ...options,
      where: [
        { field: "isActive", operator: "==", value: true },
        { field: "isDeleted", operator: "==", value: false },
        ...(options.where || []),
      ],
    });
  }

  /**
   * Search users by name
   * @param {string} searchTerm - Search term
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated users
   */
  async searchByName(searchTerm, options = {}) {
    const searchLower = searchTerm.toLowerCase();
    return this.findPaginated({
      ...options,
      where: [
        {
          field: "searchTerms",
          operator: "array-contains",
          value: searchLower,
        },
        { field: "isDeleted", operator: "==", value: false },
        ...(options.where || []),
      ],
    });
  }

  /**
   * Update user's last login time
   * @param {string} id - User ID
   * @returns {Promise<Object>} Updated user
   */
  async updateLastLogin(id) {
    return this.update(id, {
      lastLoginAt: this.db.timestamp(),
    });
  }

  /**
   * Update user's verification status
   * @param {string} id - User ID
   * @param {boolean} isVerified - Verification status
   * @returns {Promise<Object>} Updated user
   */
  async updateVerificationStatus(id, isVerified) {
    return this.update(id, {
      isVerified,
      verifiedAt: isVerified ? this.db.timestamp() : null,
    });
  }

  /**
   * Update user's FCM token for push notifications
   * @param {string} id - User ID
   * @param {string} fcmToken - FCM token
   * @returns {Promise<Object>} Updated user
   */
  async updateFcmToken(id, fcmToken) {
    return this.update(id, { fcmToken });
  }

  /**
   * Deactivate user account
   * @param {string} id - User ID
   * @returns {Promise<Object>} Updated user
   */
  async deactivateUser(id) {
    return this.update(id, {
      isActive: false,
      deactivatedAt: this.db.timestamp(),
    });
  }

  /**
   * Reactivate user account
   * @param {string} id - User ID
   * @returns {Promise<Object>} Updated user
   */
  async reactivateUser(id) {
    return this.update(id, {
      isActive: true,
      deactivatedAt: null,
    });
  }

  /**
   * Get user statistics
   * @returns {Promise<Object>} User statistics
   */
  async getStatistics() {
    const [totalUsers, activeUsers, clients, professionals] = await Promise.all(
      [
        this.count([{ field: "isDeleted", operator: "==", value: false }]),
        this.count([
          { field: "isActive", operator: "==", value: true },
          { field: "isDeleted", operator: "==", value: false },
        ]),
        this.count([
          { field: "role", operator: "==", value: "client" },
          { field: "isDeleted", operator: "==", value: false },
        ]),
        this.count([
          { field: "role", operator: "==", value: "professional" },
          { field: "isDeleted", operator: "==", value: false },
        ]),
      ],
    );

    return {
      totalUsers,
      activeUsers,
      clients,
      professionals,
    };
  }
}

export default new UserRepository();
