/**
 * Professional Model
 * Defines professional (photographer/musician/etc.) profile data structure
 */

import {
  PROFESSIONAL_CATEGORIES,
  PROFESSIONAL_STATUS,
} from "../utils/constants.util.js";

class ProfessionalModel {
  constructor(data = {}) {
    this.id = data.id || null;
    this.userId = data.userId || null;
    this.category = data.category || PROFESSIONAL_CATEGORIES.PHOTOGRAPHER;
    this.businessName = data.businessName || "";
    this.bio = data.bio || "";
    this.experience = data.experience || 0; // Years of experience
    this.specialties = data.specialties || [];
    this.portfolio = data.portfolio || [];
    this.pricing = data.pricing || this.getDefaultPricing();
    this.location = data.location || this.getDefaultLocation();
    this.serviceAreas = data.serviceAreas || [];
    this.contact = data.contact || {};
    this.status = data.status || PROFESSIONAL_STATUS.PENDING;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.isVerified = data.isVerified || false;
    this.isFeatured = data.isFeatured || false;
    this.featuredOrder = data.featuredOrder || 0;
    this.isDeleted = data.isDeleted || false;
    this.stats = data.stats || this.getDefaultStats();
    this.settings = data.settings || this.getDefaultSettings();
    this.statusReason = data.statusReason || null;
    this.statusUpdatedAt = data.statusUpdatedAt || null;
    this.approvedAt = data.approvedAt || null;
    this.rejectedAt = data.rejectedAt || null;
    this.verifiedAt = data.verifiedAt || null;
    this.createdAt = data.createdAt || null;
    this.updatedAt = data.updatedAt || null;
  }

  /**
   * Get default pricing structure
   */
  getDefaultPricing() {
    return {
      hourlyRate: 0,
      minimumHours: 1,
      packages: [],
      currency: "INR",
      travelFee: {
        enabled: false,
        perKm: 0,
        freeWithinKm: 0,
      },
    };
  }

  /**
   * Get default location structure
   */
  getDefaultLocation() {
    return {
      address: "",
      city: "",
      state: "",
      country: "",
      pincode: "",
      coordinates: {
        latitude: null,
        longitude: null,
      },
    };
  }

  /**
   * Get default stats structure
   */
  getDefaultStats() {
    return {
      totalBookings: 0,
      completedBookings: 0,
      totalReviews: 0,
      averageRating: 0,
      profileViews: 0,
      responseRate: 100,
      responseTime: 0, // Average response time in hours
    };
  }

  /**
   * Get default settings
   */
  getDefaultSettings() {
    return {
      instantBooking: false, // Requires approval if false
      autoAcceptBookings: false,
      showPricing: true,
      showContactInfo: false,
      notifyOnEnquiry: true,
      notifyOnBooking: true,
      notifyOnReview: true,
    };
  }

  /**
   * Add portfolio item
   */
  addPortfolioItem(item) {
    const portfolioItem = {
      id: item.id,
      type: item.type || "image", // image, video
      url: item.url,
      thumbnailUrl: item.thumbnailUrl || item.url,
      title: item.title || "",
      description: item.description || "",
      category: item.category || "general",
      order: this.portfolio.length,
      createdAt: new Date().toISOString(),
    };

    this.portfolio.push(portfolioItem);
    return portfolioItem;
  }

  /**
   * Remove portfolio item
   */
  removePortfolioItem(itemId) {
    const index = this.portfolio.findIndex((item) => item.id === itemId);
    if (index > -1) {
      this.portfolio.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Add specialty
   */
  addSpecialty(specialty) {
    if (!this.specialties.includes(specialty)) {
      this.specialties.push(specialty);
    }
  }

  /**
   * Remove specialty
   */
  removeSpecialty(specialty) {
    const index = this.specialties.indexOf(specialty);
    if (index > -1) {
      this.specialties.splice(index, 1);
    }
  }

  /**
   * Add pricing package
   */
  addPackage(pkg) {
    const pricingPackage = {
      id: pkg.id,
      name: pkg.name,
      description: pkg.description || "",
      price: pkg.price,
      duration: pkg.duration, // in hours
      includes: pkg.includes || [],
      isPopular: pkg.isPopular || false,
      order: this.pricing.packages.length,
    };

    this.pricing.packages.push(pricingPackage);
    return pricingPackage;
  }

  /**
   * Check if profile is complete
   */
  isProfileComplete() {
    return !!(
      this.businessName &&
      this.bio &&
      this.specialties.length > 0 &&
      this.portfolio.length > 0 &&
      this.pricing.hourlyRate > 0 &&
      this.location.city
    );
  }

  /**
   * Check if approved
   */
  isApproved() {
    return this.status === PROFESSIONAL_STATUS.APPROVED;
  }

  /**
   * Check if pending
   */
  isPending() {
    return this.status === PROFESSIONAL_STATUS.PENDING;
  }

  /**
   * Check if rejected
   */
  isRejected() {
    return this.status === PROFESSIONAL_STATUS.REJECTED;
  }

  /**
   * Calculate profile completion percentage
   */
  getCompletionPercentage() {
    let completed = 0;
    const total = 10;

    if (this.businessName) completed++;
    if (this.bio && this.bio.length >= 50) completed++;
    if (this.experience > 0) completed++;
    if (this.specialties.length > 0) completed++;
    if (this.portfolio.length >= 3) completed++;
    if (this.pricing.hourlyRate > 0) completed++;
    if (this.pricing.packages.length > 0) completed++;
    if (this.location.city) completed++;
    if (this.serviceAreas.length > 0) completed++;
    if (this.contact.phone || this.contact.email) completed++;

    return Math.round((completed / total) * 100);
  }

  /**
   * Convert to plain object for database storage
   */
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      category: this.category,
      businessName: this.businessName,
      bio: this.bio,
      experience: this.experience,
      specialties: this.specialties,
      portfolio: this.portfolio,
      pricing: this.pricing,
      location: this.location,
      serviceAreas: this.serviceAreas,
      contact: this.contact,
      status: this.status,
      isActive: this.isActive,
      isVerified: this.isVerified,
      isFeatured: this.isFeatured,
      featuredOrder: this.featuredOrder,
      isDeleted: this.isDeleted,
      stats: this.stats,
      settings: this.settings,
      statusReason: this.statusReason,
      statusUpdatedAt: this.statusUpdatedAt,
      approvedAt: this.approvedAt,
      rejectedAt: this.rejectedAt,
      verifiedAt: this.verifiedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Convert to public profile (for clients)
   */
  toPublicProfile() {
    return {
      id: this.id,
      category: this.category,
      businessName: this.businessName,
      bio: this.bio,
      experience: this.experience,
      specialties: this.specialties,
      portfolio: this.portfolio.slice(0, 10), // Limit portfolio items
      pricing: this.settings.showPricing ? this.pricing : null,
      location: {
        city: this.location.city,
        state: this.location.state,
        country: this.location.country,
      },
      serviceAreas: this.serviceAreas,
      isVerified: this.isVerified,
      isFeatured: this.isFeatured,
      stats: {
        totalReviews: this.stats.totalReviews,
        averageRating: this.stats.averageRating,
        completedBookings: this.stats.completedBookings,
      },
    };
  }

  /**
   * Convert to featured profile (minimal data)
   */
  toFeaturedProfile() {
    const mainPortfolioItem = this.portfolio[0] || null;

    return {
      id: this.id,
      category: this.category,
      businessName: this.businessName,
      specialties: this.specialties.slice(0, 3),
      thumbnail: mainPortfolioItem?.thumbnailUrl || null,
      location: {
        city: this.location.city,
        state: this.location.state,
      },
      isVerified: this.isVerified,
      stats: {
        averageRating: this.stats.averageRating,
        totalReviews: this.stats.totalReviews,
      },
      startingPrice: this.pricing.hourlyRate,
    };
  }

  /**
   * Create ProfessionalModel from database document
   */
  static fromDocument(doc) {
    return new ProfessionalModel(doc);
  }

  /**
   * Create ProfessionalModel for new registration
   */
  static forRegistration(userId, category, data = {}) {
    return new ProfessionalModel({
      ...data,
      userId,
      category,
      status: PROFESSIONAL_STATUS.PENDING,
      isActive: true,
      isVerified: false,
      isFeatured: false,
      isDeleted: false,
    });
  }
}

export default ProfessionalModel;
