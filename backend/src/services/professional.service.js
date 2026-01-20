/**
 * Professional Service
 * Business logic for professional profiles
 */

import {
  professionalRepository,
  userRepository,
  availabilityRepository,
  reviewRepository,
} from "../repositories/index.js";
import { ProfessionalModel } from "../models/index.js";
import Logger from "../utils/logger.util.js";
import { USER_ROLES, PROFESSIONAL_STATUS } from "../utils/constants.util.js";
import {
  ProfessionalNotFoundError,
  ProfessionalNotApprovedError,
  UserNotFoundError,
} from "../utils/errors.util.js";

class ProfessionalService {
  /**
   * Create professional profile
   */
  async createProfile(userId, profileData) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError();
    }

    // Check if profile already exists
    const existing = await professionalRepository.findByUserId(userId);
    if (existing) {
      return this.updateProfile(existing.id, profileData);
    }

    const {
      category,
      businessName,
      bio,
      specialties,
      pricing,
      location,
      serviceAreas,
      contact,
    } = profileData;

    const professionalModel = ProfessionalModel.forRegistration(
      userId,
      category,
      {
        businessName,
        bio,
        specialties,
        pricing,
        location: this.normalizeLocation(location),
        serviceAreas: serviceAreas?.map((a) => a.toLowerCase()) || [],
        contact,
      },
    );

    const professional = await professionalRepository.create(
      professionalModel.toJSON(),
    );

    // Update user role
    await userRepository.update(userId, { role: USER_ROLES.PROFESSIONAL });

    // Create availability schedule
    await availabilityRepository.getOrCreate(professional.id);

    Logger.logBusinessEvent("professional_created", {
      professionalId: professional.id,
      userId,
      category,
    });

    return professional;
  }

  /**
   * Get professional by ID
   */
  async getById(professionalId) {
    const professional = await professionalRepository.findById(professionalId);
    if (!professional) {
      throw new ProfessionalNotFoundError();
    }
    return professional;
  }

  /**
   * Get professional by user ID
   */
  async getByUserId(userId) {
    const professional = await professionalRepository.findByUserId(userId);
    if (!professional) {
      throw new ProfessionalNotFoundError();
    }
    return professional;
  }

  /**
   * Get professional public profile
   */
  async getPublicProfile(professionalId) {
    const professional = await professionalRepository.findById(professionalId);
    if (!professional) {
      throw new ProfessionalNotFoundError();
    }

    if (professional.status !== PROFESSIONAL_STATUS.APPROVED) {
      throw new ProfessionalNotApprovedError();
    }

    // Increment profile views
    await professionalRepository.incrementField(
      professionalId,
      "stats.profileViews",
    );

    const model = ProfessionalModel.fromDocument(professional);
    return model.toPublicProfile();
  }

  /**
   * Update professional profile
   */
  async updateProfile(professionalId, updateData) {
    const professional = await professionalRepository.findById(professionalId);
    if (!professional) {
      throw new ProfessionalNotFoundError();
    }

    const allowedFields = [
      "businessName",
      "bio",
      "experience",
      "specialties",
      "pricing",
      "location",
      "serviceAreas",
      "contact",
      "settings",
    ];

    const filteredData = {};
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    }

    if (filteredData.location) {
      filteredData.location = this.normalizeLocation(filteredData.location);
    }

    if (filteredData.serviceAreas) {
      filteredData.serviceAreas = filteredData.serviceAreas.map((a) =>
        a.toLowerCase(),
      );
    }

    const updated = await professionalRepository.update(
      professionalId,
      filteredData,
    );

    Logger.logBusinessEvent("professional_updated", { professionalId });

    return updated;
  }

  /**
   * Add portfolio item
   */
  async addPortfolioItem(professionalId, item) {
    const professional = await professionalRepository.findById(professionalId);
    if (!professional) {
      throw new ProfessionalNotFoundError();
    }

    const portfolioItem = {
      id: item.id,
      type: item.type || "image",
      url: item.url,
      thumbnailUrl: item.thumbnailUrl || item.url,
      title: item.title || "",
      description: item.description || "",
      category: item.category || "general",
      order: professional.portfolio?.length || 0,
      createdAt: new Date().toISOString(),
    };

    const updated = await professionalRepository.addPortfolioItem(
      professionalId,
      portfolioItem,
    );
    return updated;
  }

  /**
   * Remove portfolio item
   */
  async removePortfolioItem(professionalId, itemId) {
    const professional = await professionalRepository.findById(professionalId);
    if (!professional) {
      throw new ProfessionalNotFoundError();
    }

    const item = professional.portfolio?.find((p) => p.id === itemId);
    if (!item) {
      throw new Error("Portfolio item not found");
    }

    const updated = await professionalRepository.removePortfolioItem(
      professionalId,
      item,
    );
    return updated;
  }

  /**
   * Search professionals
   */
  async search(filters, options = {}) {
    const result = await professionalRepository.search(filters, {
      page: options.page || 1,
      pageSize: options.pageSize || 20,
      orderBy: this.getSortField(options.sortBy),
      orderDirection: this.getSortDirection(options.sortBy),
    });

    return {
      data: result.data.map((p) =>
        ProfessionalModel.fromDocument(p).toPublicProfile(),
      ),
      pagination: result.pagination,
    };
  }

  /**
   * Get featured professionals
   */
  async getFeatured(options = {}) {
    const result = await professionalRepository.findFeatured(options);
    return {
      data: result.data.map((p) =>
        ProfessionalModel.fromDocument(p).toFeaturedProfile(),
      ),
      pagination: result.pagination,
    };
  }

  /**
   * Get professionals by category
   */
  async getByCategory(category, options = {}) {
    const result = await professionalRepository.findByCategory(
      category,
      options,
    );
    return {
      data: result.data.map((p) =>
        ProfessionalModel.fromDocument(p).toPublicProfile(),
      ),
      pagination: result.pagination,
    };
  }

  /**
   * Get top rated professionals
   */
  async getTopRated(limit = 10) {
    const professionals = await professionalRepository.findTopRated(limit);
    return professionals.map((p) =>
      ProfessionalModel.fromDocument(p).toFeaturedProfile(),
    );
  }

  /**
   * Approve professional (admin)
   */
  async approve(professionalId, adminId) {
    const professional = await professionalRepository.findById(professionalId);
    if (!professional) {
      throw new ProfessionalNotFoundError();
    }

    const updated = await professionalRepository.updateStatus(
      professionalId,
      PROFESSIONAL_STATUS.APPROVED,
    );

    Logger.logBusinessEvent("professional_approved", {
      professionalId,
      adminId,
    });

    return updated;
  }

  /**
   * Reject professional (admin)
   */
  async reject(professionalId, adminId, reason) {
    const professional = await professionalRepository.findById(professionalId);
    if (!professional) {
      throw new ProfessionalNotFoundError();
    }

    const updated = await professionalRepository.updateStatus(
      professionalId,
      PROFESSIONAL_STATUS.REJECTED,
      reason,
    );

    Logger.logBusinessEvent("professional_rejected", {
      professionalId,
      adminId,
      reason,
    });

    return updated;
  }

  /**
   * Get pending approvals (admin)
   */
  async getPendingApprovals(options = {}) {
    return professionalRepository.findPendingApproval(options);
  }

  /**
   * Set featured status (admin)
   */
  async setFeatured(professionalId, isFeatured, order = null) {
    const professional = await professionalRepository.findById(professionalId);
    if (!professional) {
      throw new ProfessionalNotFoundError();
    }

    const updated = await professionalRepository.setFeatured(
      professionalId,
      isFeatured,
      order,
    );

    Logger.logBusinessEvent("professional_featured", {
      professionalId,
      isFeatured,
    });

    return updated;
  }

  /**
   * Activate/Deactivate profile
   */
  async setActive(professionalId, isActive) {
    const professional = await professionalRepository.findById(professionalId);
    if (!professional) {
      throw new ProfessionalNotFoundError();
    }

    const updated = await professionalRepository.update(professionalId, {
      isActive,
    });

    Logger.logBusinessEvent("professional_status_changed", {
      professionalId,
      isActive,
    });

    return updated;
  }

  /**
   * Get statistics (admin)
   */
  async getStatistics() {
    return professionalRepository.getStatistics();
  }

  /**
   * Normalize location data
   */
  normalizeLocation(location) {
    if (!location) return null;
    return {
      ...location,
      city: location.city?.toLowerCase(),
      state: location.state?.toLowerCase(),
      country: location.country?.toLowerCase(),
    };
  }

  /**
   * Get sort field from sort option
   */
  getSortField(sortBy) {
    const sortFields = {
      rating_desc: "stats.averageRating",
      rating_asc: "stats.averageRating",
      price_desc: "pricing.hourlyRate",
      price_asc: "pricing.hourlyRate",
      newest: "createdAt",
      popular: "stats.totalBookings",
    };
    return sortFields[sortBy] || "stats.averageRating";
  }

  /**
   * Get sort direction from sort option
   */
  getSortDirection(sortBy) {
    return sortBy?.includes("asc") ? "asc" : "desc";
  }
}

export default new ProfessionalService();
