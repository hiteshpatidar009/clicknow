/**
 * User Model
 * Defines user data structure and transformations
 */

import { USER_ROLES } from "../utils/constants.util.js";

class UserModel {
  constructor(data = {}) {
    this.id = data.id || null;
    this.firebaseUid = data.firebaseUid || null;
    this.email = data.email ? data.email.toLowerCase() : null;
    this.phone = data.phone || null;
    this.firstName = data.firstName || "";
    this.lastName = data.lastName || "";
    this.displayName =
      data.displayName || `${this.firstName} ${this.lastName}`.trim();
    this.avatar = data.avatar || null;
    this.role = data.role || USER_ROLES.CLIENT;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.isVerified = data.isVerified || false;
    this.isDeleted = data.isDeleted || false;
    this.fcmToken = data.fcmToken || null;
    this.settings = data.settings || this.getDefaultSettings();
    this.searchTerms = data.searchTerms || this.generateSearchTerms();
    this.createdAt = data.createdAt || null;
    this.updatedAt = data.updatedAt || null;
    this.lastLoginAt = data.lastLoginAt || null;
    this.verifiedAt = data.verifiedAt || null;
    this.deactivatedAt = data.deactivatedAt || null;
  }

  /**
   * Get default user settings
   */
  getDefaultSettings() {
    return {
      notifications: {
        push: true,
        email: false,
        whatsapp: true,
        marketing: true,
      },
      privacy: {
        showEmail: false,
        showPhone: false,
      },
      language: "en",
      timezone: "UTC",
    };
  }

  /**
   * Generate search terms for full-text search
   */
  generateSearchTerms() {
    const terms = new Set();

    if (this.firstName) {
      terms.add(this.firstName.toLowerCase());
    }

    if (this.lastName) {
      terms.add(this.lastName.toLowerCase());
    }

    if (this.displayName) {
      this.displayName
        .toLowerCase()
        .split(" ")
        .forEach((term) => {
          if (term.length > 1) terms.add(term);
        });
    }

    if (this.email) {
      terms.add(this.email.toLowerCase());
      const emailPrefix = this.email.split("@")[0].toLowerCase();
      terms.add(emailPrefix);
    }

    return Array.from(terms);
  }

  /**
   * Get full name
   */
  getFullName() {
    return (
      `${this.firstName} ${this.lastName}`.trim() ||
      this.displayName ||
      "Unknown User"
    );
  }

  /**
   * Check if user is admin
   */
  isAdmin() {
    return this.role === USER_ROLES.ADMIN;
  }

  /**
   * Check if user is professional
   */
  isProfessional() {
    return this.role === USER_ROLES.PROFESSIONAL;
  }

  /**
   * Check if user is client
   */
  isClient() {
    return this.role === USER_ROLES.CLIENT;
  }

  /**
   * Convert to plain object for database storage
   */
  toJSON() {
    return {
      id: this.id,
      firebaseUid: this.firebaseUid,
      email: this.email,
      phone: this.phone,
      firstName: this.firstName,
      lastName: this.lastName,
      displayName: this.displayName,
      avatar: this.avatar,
      role: this.role,
      isActive: this.isActive,
      isVerified: this.isVerified,
      isDeleted: this.isDeleted,
      fcmToken: this.fcmToken,
      settings: this.settings,
      searchTerms: this.searchTerms,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      lastLoginAt: this.lastLoginAt,
      verifiedAt: this.verifiedAt,
      deactivatedAt: this.deactivatedAt,
    };
  }

  /**
   * Convert to public profile (safe for API response)
   */
  toPublicProfile() {
    return {
      id: this.id,
      displayName: this.displayName,
      avatar: this.avatar,
      role: this.role,
      isVerified: this.isVerified,
    };
  }

  /**
   * Create UserModel from database document
   */
  static fromDocument(doc) {
    return new UserModel(doc);
  }

  /**
   * Create UserModel for new user registration
   */
  static forRegistration(data) {
    return new UserModel({
      ...data,
      isActive: true,
      isVerified: false,
      isDeleted: false,
    });
  }
}

export default UserModel;
