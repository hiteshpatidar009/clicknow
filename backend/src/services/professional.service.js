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
    const normalizedProfileData = this.normalizeRegistrationPayload(profileData);

    // JWT auth already validates the user — DB lookup is for role updates only.
    // If user is not in DB (dev auth / Firebase user), we still allow profile creation.
    const user = await userRepository.findById(userId);

    const existing = await professionalRepository.findByUserId(userId);
    if (existing) {
      return this.updateProfile(existing.id, normalizedProfileData);
    }

    const {
      category,
      businessName,
      bio,
      experience,
      specialties,
      pricing,
      location,
      serviceAreas,
      contact,
      personalDetails,
      workDetails,
      documents,
      bankDetails,
    } = normalizedProfileData;

    const professionalModel = ProfessionalModel.forRegistration(
      userId,
      category,
      {
        businessName,
        bio,
        experience,
        specialties,
        pricing,
        location: this.normalizeLocation(location),
        serviceAreas: serviceAreas?.map((a) => a.toLowerCase()) || [],
        contact,
        personalDetails,
        workDetails,
        documents,
        bankDetails,
      },
    );

    const professional = await professionalRepository.create(
      professionalModel.toJSON(),
    );

    await userRepository.update(userId, { role: USER_ROLES.PROFESSIONAL });

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
    const normalizedUpdateData = this.normalizeRegistrationPayload(updateData);
    const professional = await professionalRepository.findById(professionalId);
    if (!professional) {
      throw new ProfessionalNotFoundError();
    }

    const allowedFields = [
      "category",
      "businessName",
      "bio",
      "experience",
      "specialties",
      "pricing",
      "location",
      "serviceAreas",
      "contact",
      "settings",
      "personalDetails",
      "workDetails",
      "documents",
      "bankDetails",
    ];

    const filteredData = {};
    for (const field of allowedFields) {
      if (normalizedUpdateData[field] !== undefined) {
        filteredData[field] = normalizedUpdateData[field];
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
   * Public portfolio gallery with category filter
   */
  async getPortfolioGallery(professionalId, options = {}) {
    const professional = await professionalRepository.findById(professionalId);
    if (!professional) {
      throw new ProfessionalNotFoundError();
    }

    if (professional.status !== PROFESSIONAL_STATUS.APPROVED) {
      throw new ProfessionalNotApprovedError();
    }

    const categoryFilter = String(options.category || "").trim().toLowerCase();
    const page = Math.max(parseInt(options.page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(options.pageSize, 10) || 20, 1), 100);

    const portfolio = Array.isArray(professional.portfolio)
      ? professional.portfolio
      : [];

    const filtered =
      categoryFilter && categoryFilter !== "all"
        ? portfolio.filter(
            (item) => String(item.category || "general").toLowerCase() === categoryFilter,
          )
        : portfolio;

    const categories = [
      "all",
      ...Array.from(
        new Set(
          portfolio
            .map((item) => String(item.category || "general").toLowerCase())
            .filter(Boolean),
        ),
      ),
    ];

    const start = (page - 1) * pageSize;
    const data = filtered.slice(start, start + pageSize);

    return {
      professionalId: professional.id,
      professionalName: professional.businessName,
      categories,
      data,
      pagination: {
        page,
        pageSize,
        totalCount: filtered.length,
        totalPages: Math.max(1, Math.ceil(filtered.length / pageSize)),
        hasMore: start + data.length < filtered.length,
      },
    };
  }

  normalizeRegistrationPayload(payload = {}) {
    const out = { ...payload };

    const about = payload.aboutYourself || payload.personalInfo || {};
    const profile = payload.professionalProfile || payload.profile || {};
    const legal =
      payload.legalIdentityVerification || payload.legalVerification || {};
    const pricingSetup =
      payload.pricingAndPaymentSetup || payload.paymentSetup || {};
    const services =
      payload.servicesAndSpeciality ||
      payload.servicesAndSpecialty ||
      payload.serviceSelection ||
      {};

    const pickFirst = (...values) =>
      values.find((v) => v !== undefined && v !== null && v !== "");

    const normalizeArray = (value) => {
      if (Array.isArray(value)) return value;
      if (typeof value === "string") {
        return value
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean);
      }
      return undefined;
    };

    out.category = this.normalizeCategory(
      pickFirst(
        out.category,
        out.serviceType,
        profile.workSpecialization,
        profile.serviceType,
        services.category,
        services.serviceType,
      ),
    );
    out.businessName = pickFirst(
      out.businessName,
      out.brandName,
      out.companyName,
      profile.businessName,
      profile.brandName,
      profile.companyName,
      about.businessName,
      about.fullName,
    );
    out.bio = pickFirst(out.bio, profile.bio, profile.aboutMe, about.aboutMe);
    out.experience = pickFirst(
      out.experience,
      out.yearsOfExperience,
      profile.yearsOfExperience,
      pricingSetup.yearsOfExperience,
    );
    out.specialties =
      out.specialties ||
      normalizeArray(profile.specialties) ||
      normalizeArray(services.specialties) ||
      normalizeArray(services.services);

    const location = { ...(out.location || {}) };
    const locationCity = pickFirst(
      location.city,
      out.workingAreaCity,
      profile.workingAreaCity,
      profile.city,
      pricingSetup.city,
    );
    const locationState = pickFirst(location.state, profile.state);
    if (locationCity) location.city = locationCity;
    if (locationState) location.state = locationState;
    if (Object.keys(location).length > 0) out.location = location;

    out.serviceAreas =
      out.serviceAreas ||
      normalizeArray(profile.serviceAreas) ||
      normalizeArray(profile.workingAreas) ||
      normalizeArray(services.serviceAreas);

    const contact = { ...(out.contact || {}) };
    const phone = pickFirst(contact.phone, out.phoneNumber, about.phoneNumber);
    const whatsapp = pickFirst(
      contact.whatsapp,
      out.whatsappNumber,
      about.whatsappNumber,
    );
    if (phone) contact.phone = phone;
    if (whatsapp) contact.whatsapp = whatsapp;
    if (Object.keys(contact).length > 0) out.contact = contact;

    const personalDetails = { ...(out.personalDetails || {}) };
    const gender = pickFirst(personalDetails.gender, about.gender);
    const dob = pickFirst(personalDetails.dob, out.dateOfBirth, about.dob, about.dateOfBirth);
    const permanentAddress = pickFirst(
      personalDetails.permanentAddress,
      about.permanentAddress,
      about.address,
    );
    const languagesKnown =
      personalDetails.languagesKnown ||
      normalizeArray(about.languagesKnown) ||
      normalizeArray(about.languages);
    if (gender) personalDetails.gender = String(gender).toLowerCase();
    if (dob) personalDetails.dob = dob;
    if (permanentAddress) personalDetails.permanentAddress = permanentAddress;
    if (languagesKnown) personalDetails.languagesKnown = languagesKnown;
    if (Object.keys(personalDetails).length > 0) out.personalDetails = personalDetails;

    const workDetails = { ...(out.workDetails || {}) };
    const workingDays =
      workDetails.availableWorkingDays ||
      normalizeArray(profile.availableWorkingDays) ||
      normalizeArray(profile.workingDays);
    const startTime = pickFirst(
      workDetails.startTime,
      profile.startTime,
      profile.workStartTime,
    );
    const endTime = pickFirst(
      workDetails.endTime,
      profile.endTime,
      profile.workEndTime,
    );
    const equipmentDetails = pickFirst(
      workDetails.equipmentDetails,
      profile.equipmentDetails,
      profile.equipment,
    );
    if (workingDays) workDetails.availableWorkingDays = workingDays;
    if (startTime) workDetails.startTime = startTime;
    if (endTime) workDetails.endTime = endTime;
    if (equipmentDetails) workDetails.equipmentDetails = equipmentDetails;
    if (Object.keys(workDetails).length > 0) out.workDetails = workDetails;

    const documents = { ...(out.documents || {}) };
    const aadharNumber = pickFirst(
      documents.aadharNumber,
      legal.aadharNumber,
      legal.aadhaarNumber,
    );
    const panNumber = pickFirst(documents.panNumber, legal.panNumber);
    const gstNumber = pickFirst(documents.gstNumber, legal.gstNumber);
    const aadharFront = pickFirst(
      documents.aadharFront,
      legal.aadharFront,
      legal.aadhaarFront,
      legal.aadharFrontUrl,
    );
    const aadharBack = pickFirst(
      documents.aadharBack,
      legal.aadharBack,
      legal.aadhaarBack,
      legal.aadharBackUrl,
    );
    const panCard = pickFirst(documents.panCard, legal.panCard, legal.panCardUrl);
    const pvc = pickFirst(
      documents.policeVerificationCertificate,
      legal.policeVerificationCertificate,
      legal.policeVerificationCertificateUrl,
    );
    if (aadharNumber) documents.aadharNumber = aadharNumber;
    if (panNumber) documents.panNumber = panNumber;
    if (gstNumber) documents.gstNumber = gstNumber;
    if (aadharFront) documents.aadharFront = aadharFront;
    if (aadharBack) documents.aadharBack = aadharBack;
    if (panCard) documents.panCard = panCard;
    if (pvc) documents.policeVerificationCertificate = pvc;
    if (Object.keys(documents).length > 0) out.documents = documents;

    const bankDetails = { ...(out.bankDetails || {}) };
    const accountNumber = pickFirst(
      bankDetails.accountNumber,
      pricingSetup.accountNumber,
    );
    const ifscCode = pickFirst(bankDetails.ifscCode, pricingSetup.ifscCode);
    const bankName = pickFirst(bankDetails.bankName, pricingSetup.bankName);
    const accountHolderName = pickFirst(
      bankDetails.accountHolderName,
      pricingSetup.accountHolderName,
    );
    const upiId = pickFirst(bankDetails.upiId, pricingSetup.upiId);
    if (accountNumber) bankDetails.accountNumber = accountNumber;
    if (ifscCode) bankDetails.ifscCode = String(ifscCode).toUpperCase();
    if (bankName) bankDetails.bankName = bankName;
    if (accountHolderName) bankDetails.accountHolderName = accountHolderName;
    if (upiId) bankDetails.upiId = upiId;
    if (Object.keys(bankDetails).length > 0) out.bankDetails = bankDetails;

    const pricing = { ...(out.pricing || {}) };
    const hourlyRate = pickFirst(
      pricing.hourlyRate,
      pricingSetup.hourlyRate,
      pricingSetup.pricingPerBooking,
      pricingSetup.basePrice,
    );
    const travelFeeEnabled = pickFirst(
      pricing.travelFee?.enabled,
      pricingSetup.travelChargesEnabled,
      pricingSetup.travelFeeEnabled,
    );
    const travelPerKm = pickFirst(
      pricing.travelFee?.perKm,
      pricingSetup.travelChargePerKm,
      pricingSetup.travelPerKm,
    );
    if (hourlyRate !== undefined) pricing.hourlyRate = hourlyRate;
    if (travelFeeEnabled !== undefined || travelPerKm !== undefined) {
      pricing.travelFee = {
        ...(pricing.travelFee || {}),
        ...(travelFeeEnabled !== undefined ? { enabled: !!travelFeeEnabled } : {}),
        ...(travelPerKm !== undefined ? { perKm: Number(travelPerKm) } : {}),
      };
    }
    if (Object.keys(pricing).length > 0) out.pricing = pricing;

    return out;
  }

  normalizeCategory(category) {
    if (!category) return category;
    const raw = String(category).trim().toLowerCase();
    const normalized = raw.replace(/[\s-]+/g, "_");

    if (["photography", "photo", "photographer"].includes(normalized)) {
      return "photographer";
    }
    if (["videography", "video", "videographer"].includes(normalized)) {
      return "videographer";
    }
    if (["cinematography", "cinematic", "cinematographer"].includes(normalized)) {
      return "cinematographer";
    }
    if (["editing", "editor", "photo_editor", "video_editor"].includes(normalized)) {
      return "editor";
    }
    return raw;
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
   * Admin search professionals
   */
  async adminSearch(filters, options = {}) {
    const result = await professionalRepository.adminSearch(filters, {
      page: options.page || 1,
      pageSize: options.pageSize || 20,
      orderBy: "createdAt",
      orderDirection: "desc",
    });

    // For admin, we might want consistent view, e.g. public profile + extra
    // But keeping it simple for now, relying on public profile structure + status
    return {
      data: result.data.map((p) => {
         const model = ProfessionalModel.fromDocument(p);
         const json = model.toJSON();
         
         const status = json.status ? json.status : 'unknown';
         const statusCapitalized = status.charAt(0).toUpperCase() + status.slice(1);
         
         let dateStr = "N/A";
         if (json.createdAt) {
             try {
                const dateObj = json.createdAt.toDate ? json.createdAt.toDate() : new Date(json.createdAt);
                if (!isNaN(dateObj.getTime())) {
                    dateStr = dateObj.toISOString().split('T')[0];
                }
             } catch (e) {
                // Keep N/A
             }
         }

         return {
             id: json.id,
             name: json.businessName || "Unknown", 
             service: json.category || "Unknown",
             city: json.location?.city || "N/A",
             experience: json.experience ? `${json.experience} years` : "0 years",
             status: statusCapitalized,
             date: dateStr,
             ...json 
         };
      }),
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
   * Suspend professional (admin)
   *
   * DESIGN: When suspended:
   *  1. Professional profile status → 'suspended', isActive → false
   *  2. User role → 'client' (downgraded — loses professional access)
   *  3. They can still login and book as a customer
   *  Reversible via reactivate()
   */
  async suspend(professionalId, adminId, reason) {
    const professional = await professionalRepository.findById(professionalId);
    if (!professional) {
      throw new ProfessionalNotFoundError();
    }

    await professionalRepository.update(professionalId, {
      status: 'suspended',
      isActive: false,
      statusReason: reason || 'Suspended by admin',
      statusUpdatedAt: new Date(),
    });

    // Downgrade user role back to 'client'
    await userRepository.update(professional.userId, {
      role: USER_ROLES.CLIENT,
    });

    Logger.logBusinessEvent('professional_suspended', {
      professionalId,
      userId: professional.userId,
      adminId,
      reason,
    });

    return {
      professionalId,
      userId: professional.userId,
      status: 'suspended',
      userRole: USER_ROLES.CLIENT,
      message: 'Professional suspended. User role downgraded to client.',
    };
  }

  /**
   * Reactivate a suspended professional (admin)
   *
   * Reverses a suspension:
   *  1. Professional profile status → 'approved', isActive → true
   *  2. User role → 'professional' (restored)
   */
  async reactivate(professionalId, adminId) {
    const professional = await professionalRepository.findById(professionalId);
    if (!professional) {
      throw new ProfessionalNotFoundError();
    }

    await professionalRepository.update(professionalId, {
      status: PROFESSIONAL_STATUS.APPROVED,
      isActive: true,
      statusReason: 'Reactivated by admin',
      statusUpdatedAt: new Date(),
    });

    await userRepository.update(professional.userId, {
      role: USER_ROLES.PROFESSIONAL,
    });

    Logger.logBusinessEvent('professional_reactivated', {
      professionalId,
      userId: professional.userId,
      adminId,
    });

    return {
      professionalId,
      userId: professional.userId,
      status: PROFESSIONAL_STATUS.APPROVED,
      userRole: USER_ROLES.PROFESSIONAL,
      message: 'Professional reactivated. User role restored to professional.',
    };
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
   * Find matches for a booking
   */
  async findMatchesForBooking(booking) {
    // 1. Determine Category from Booking
    // This mapping depends on how eventType/serviceType stores data.
    // Assuming simplistic mapping for now or using specific field if available.
    let category = "photographer"; // default
    if (booking.eventDetails?.serviceType) {
         category = booking.eventDetails.serviceType.toLowerCase();
    } else if (booking.eventType) {
         // Try to map eventType words to categories
         const type = booking.eventType.toLowerCase();
         if (type.includes("photo")) category = "photographer";
         else if (type.includes("video")) category = "videographer";
         else if (type.includes("dj")) category = "dj";
         else if (type.includes("music")) category = "musician";
         else if (type.includes("makeup")) category = "makeup_artist";
         else if (type.includes("planner")) category = "wedding_planner";
    }

    // 2. Fetch all approved pros in this category
    // We use repository directly or search method.
    // Fetching all might be heavy eventually, but ok for now. 
    const allProsInCat = await professionalRepository.findByCategory(category, {
        limit: 100 // reasonable limit for auto-suggestions
    });
    
    const candidates = allProsInCat.data || [];
    
    const matches = [];

    // 3. Ranking Logic
    const bookingLoc = booking.location || {};
    const bPincode = bookingLoc.pincode ? String(bookingLoc.pincode).trim() : "";
    const bCity = bookingLoc.city ? bookingLoc.city.toLowerCase().trim() : "";
    const bState = bookingLoc.state ? bookingLoc.state.toLowerCase().trim() : "";

    for (const pro of candidates) {
        const pLoc = pro.location || {};
        const pPincode = pLoc.pincode ? String(pLoc.pincode).trim() : "";
        const pCity = pLoc.city ? pLoc.city.toLowerCase().trim() : "";
        const pState = pLoc.state ? pLoc.state.toLowerCase().trim() : "";

        let matchType = "Service Match";
        let score = 0;

        if (bPincode && pPincode === bPincode) {
            matchType = "Pincode Match";
            score = 3;
        } else if (bCity && pCity === bCity) {
            matchType = "City Match";
            score = 2;
        } else if (bState && pState === bState) {
            matchType = "State Match";
            score = 1;
        }

        matches.push({
            professional: ProfessionalModel.fromDocument(pro).toPublicProfile(),
            matchType,
            score
        });
    }

    // 4. Sort by Score (Desc) then Rating (Desc)
    matches.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return (b.professional.rating || 0) - (a.professional.rating || 0);
    });

    return matches;
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
