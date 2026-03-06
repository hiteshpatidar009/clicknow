import Joi from "joi";

/**
 * PROFESSIONAL ONBOARDING — STEP FLOW (matches Figma)
 *
 * STEP 1 — Tell About Yourself       POST /professionals
 *           category, businessName, bio, experience, specialties, personalDetails
 *
 * STEP 2 — Build Professional Profile PUT /professionals/me
 *           workDetails, location, serviceAreas, contact
 *
 * STEP 3 — Legal & Identity          PUT /professionals/me
 *           documents { aadharNumber, aadharFront, aadharBack, panNumber, panCard, policeVerificationCertificate }
 *
 * STEP 4 — Pricing & Payment Setup   PUT /professionals/me
 *           pricing, bankDetails
 *
 * STEP 5 — Portfolio                 POST /professionals/me/portfolio
 *           type, url, title, category
 *
 * → All steps use the SAME endpoints. The distinction is which fields are sent.
 * → Documents are NEVER required at creation time. Only admin checks before approval.
 */

// ─── Valid categories (expands on base set to match Figma) ─────────────────────
const VALID_CATEGORIES = [
  "photographer",
  "videographer",
  "cinematographer",
  "editor",
  "dj",
  "musician",
  "anchor",
  "live_wedding_planner",
  "dancer",
  "decorator",
  "makeup_artist",
  "caterer",
  "tent_house",
  "band",
  "other",
];

// ─── Sub-schemas ───────────────────────────────────────────────────────────────

const locationSchema = Joi.object({
  address: Joi.string().max(500).optional(),
  city: Joi.string().max(100).optional(),       // optional — filled in step 2
  state: Joi.string().max(100).optional(),
  country: Joi.string().max(100).default("India"),
  pincode: Joi.string().pattern(/^\d{6}$/).optional(),
  coordinates: Joi.object({
    latitude: Joi.number().min(-90).max(90),
    longitude: Joi.number().min(-180).max(180),
  }).optional(),
});

const pricingSchema = Joi.object({
  hourlyRate: Joi.number().min(0).optional(),
  minimumHours: Joi.number().min(1).default(1),
  currency: Joi.string().valid("INR", "USD").default("INR"),
  packages: Joi.array().items(
    Joi.object({
      name: Joi.string().max(100).required(),
      description: Joi.string().max(500).optional(),
      price: Joi.number().min(0).required(),
      duration: Joi.number().min(1).required(),
      includes: Joi.array().items(Joi.string()).optional(),     // alias: deliverables
      deliverables: Joi.array().items(Joi.string()).optional(), // keep both
      isPopular: Joi.boolean().optional(),
      order: Joi.number().optional(),
    })
  ).optional(),
  travelFee: Joi.object({
    enabled: Joi.boolean().optional(),
    perKm: Joi.number().min(0).optional(),
    freeWithinKm: Joi.number().min(0).optional(),
  }).optional(),
});

const contactSchema = Joi.object({
  email: Joi.string().email().optional(),
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
  whatsapp: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
  website: Joi.string().uri().optional(),
  instagram: Joi.string().max(100).optional(),
  facebook: Joi.string().max(100).optional(),
});

const personalDetailsSchema = Joi.object({
  gender: Joi.string().valid("male", "female", "other").optional(),
  dob: Joi.alternatives().try(Joi.date().iso(), Joi.string()).optional(),
  languagesKnown: Joi.array().items(Joi.string()).optional(),
  permanentAddress: Joi.string().max(500).optional(),
});

const workDetailsSchema = Joi.object({
  // Accept both "Monday" and "monday" — auto-lowercase on frontend is common
  availableWorkingDays: Joi.array().items(
    Joi.string().valid(
      "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
      "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
    )
  ).optional(),
  startTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
  endTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
  equipmentDetails: Joi.string().max(1000).optional(),
  socialLinks: Joi.object({
    instagram: Joi.string().optional(),  // accept plain handle OR full URL
    website: Joi.string().optional(),
    googleMap: Joi.string().optional(),
  }).optional(),
});

// Documents — ALL optional at every step
// Images are stored as URLs (uploaded via POST /uploads first, then URL saved here)
const documentsSchema = Joi.object({
  aadharNumber: Joi.string().pattern(/^\d{4}[\s-]?\d{4}[\s-]?\d{4}$/).optional()
    .messages({ "string.pattern.base": "Aadhar number must be 12 digits" }),
  panNumber: Joi.string().pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).optional()
    .messages({ "string.pattern.base": "PAN must be in format ABCDE1234F" }),
  gstNumber: Joi.string().max(15).optional(),
  // Image URLs — uploaded via POST /uploads, then stored here
  aadharFront: Joi.string().optional(),   // URL of uploaded Aadhar front image
  aadharBack: Joi.string().optional(),    // URL of uploaded Aadhar back image
  panCard: Joi.string().optional(),       // URL of uploaded PAN card image
  policeVerificationCertificate: Joi.string().optional(), // URL of PVC document
  verificationStatus: Joi.string().optional(),
});

const bankDetailsSchema = Joi.object({
  accountNumber: Joi.string().min(8).max(20).optional(),
  ifscCode: Joi.string().pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/).optional()
    .messages({ "string.pattern.base": "IFSC must be in format HDFC0001234" }),
  bankName: Joi.string().max(100).optional(),
  accountHolderName: Joi.string().max(100).optional(),
  upiId: Joi.string().max(50).optional(),
});

// ─── STEP 1: Create Profile ─────────────────────────────────────────────────────
// POST /professionals
// Only category + businessName required. Everything else is optional (filled later).
export const createProfileSchema = {
  body: Joi.object({
    // Required in step 1
    category: Joi.string().valid(...VALID_CATEGORIES).required()
      .messages({ "any.only": `category must be one of: ${VALID_CATEGORIES.join(", ")}` }),
    businessName: Joi.string().min(2).max(100).required(),

    // Optional in step 1 (Tell About Yourself screen)
    bio: Joi.string().min(2).max(2000).optional(),
    specialties: Joi.array().items(Joi.string()).max(10).optional(),
    experience: Joi.number().min(0).max(50).optional(),
    personalDetails: personalDetailsSchema.optional(),

    // Step 2+ fields (passed here for single-call onboarding, but all optional)
    workDetails: workDetailsSchema.optional(),
    location: locationSchema.optional(),
    serviceAreas: Joi.array().items(Joi.string()).max(20).optional(),
    contact: contactSchema.optional(),

    // Step 3 fields
    documents: documentsSchema.optional(),

    // Step 4 fields
    pricing: pricingSchema.optional(),
    bankDetails: bankDetailsSchema.optional(),

    // Aliases used in some frontend implementations
    brandName: Joi.string().optional(),
    companyName: Joi.string().optional(),
    serviceType: Joi.string().optional(),
    yearsOfExperience: Joi.number().optional(),
    workingAreaCity: Joi.string().optional(),
    phoneNumber: Joi.string().optional(),
    whatsappNumber: Joi.string().optional(),
    dateOfBirth: Joi.alternatives().try(Joi.string(), Joi.date()).optional(),

    // Figma structured payloads (accepted but normalized in service layer)
    aboutYourself: Joi.object().unknown(true).optional(),
    professionalProfile: Joi.object().unknown(true).optional(),
    legalIdentityVerification: Joi.object().unknown(true).optional(),
    legalVerification: Joi.object().unknown(true).optional(),
    pricingAndPaymentSetup: Joi.object().unknown(true).optional(),
    servicesAndSpeciality: Joi.object().unknown(true).optional(),
    servicesAndSpecialty: Joi.object().unknown(true).optional(),
    serviceSelection: Joi.object().unknown(true).optional(),
  }),
  // ✅ NO .custom(validateRequiredRegistrationDocuments) here
  // Documents are validated by admin before approval, NOT at registration time
};

// ─── STEP 2–5: Update Profile ───────────────────────────────────────────────────
// PUT /professionals/me
// All fields optional — send whichever fields are being updated in that step.
export const updateProfileSchema = {
  body: Joi.object({
    businessName: Joi.string().min(2).max(100).optional(),
    bio: Joi.string().min(2).max(2000).optional(),
    specialties: Joi.array().items(Joi.string()).max(10).optional(),
    experience: Joi.number().min(0).max(50).optional(),
    category: Joi.string().valid(...VALID_CATEGORIES).optional(),

    personalDetails: personalDetailsSchema.optional(),
    workDetails: workDetailsSchema.optional(),
    location: locationSchema.optional(),
    serviceAreas: Joi.array().items(Joi.string()).max(20).optional(),
    contact: contactSchema.optional(),
    documents: documentsSchema.optional(),
    pricing: pricingSchema.optional(),
    bankDetails: bankDetailsSchema.optional(),

    settings: Joi.object({
      instantBooking: Joi.boolean().optional(),
      autoReply: Joi.boolean().optional(),
      autoReplyMessage: Joi.string().max(500).optional(),
      autoAcceptBookings: Joi.boolean().optional(),
      showPricing: Joi.boolean().optional(),
      showContactInfo: Joi.boolean().optional(),
      notifyOnEnquiry: Joi.boolean().optional(),
      notifyOnBooking: Joi.boolean().optional(),
      notifyOnReview: Joi.boolean().optional(),
    }).optional(),

    // Aliases
    brandName: Joi.string().optional(),
    companyName: Joi.string().optional(),
    serviceType: Joi.string().optional(),
    yearsOfExperience: Joi.number().optional(),
    workingAreaCity: Joi.string().optional(),
    phoneNumber: Joi.string().optional(),
    whatsappNumber: Joi.string().optional(),
    dateOfBirth: Joi.alternatives().try(Joi.string(), Joi.date()).optional(),
    aboutYourself: Joi.object().unknown(true).optional(),
    professionalProfile: Joi.object().unknown(true).optional(),
    legalIdentityVerification: Joi.object().unknown(true).optional(),
    legalVerification: Joi.object().unknown(true).optional(),
    pricingAndPaymentSetup: Joi.object().unknown(true).optional(),
    servicesAndSpeciality: Joi.object().unknown(true).optional(),
    servicesAndSpecialty: Joi.object().unknown(true).optional(),
    serviceSelection: Joi.object().unknown(true).optional(),
  }),
};

// ─── Portfolio ──────────────────────────────────────────────────────────────────
export const addPortfolioSchema = {
  body: Joi.object({
    id: Joi.string().optional(), // optional — generated server-side if missing
    type: Joi.string().valid("image", "video").default("image"),
    url: Joi.string().required(),              // URL from POST /uploads
    thumbnailUrl: Joi.string().optional(),
    title: Joi.string().max(100).optional(),
    description: Joi.string().max(500).optional(),
    category: Joi.string().max(50).optional(), // wedding, portrait, corporate...
    order: Joi.number().optional(),
  }),
};

// ─── Params ─────────────────────────────────────────────────────────────────────
export const portfolioItemParamSchema = {
  params: Joi.object({
    id: Joi.string().required(),
    itemId: Joi.string().required(),
  }),
};

export const professionalIdParamSchema = {
  params: Joi.object({
    id: Joi.string().required(),
  }),
};

// ─── Admin Schemas ───────────────────────────────────────────────────────────────
export const adminUpdateAboutSchema = {
  body: Joi.object({
    businessName: Joi.string().min(2).max(100).optional(),
    bio: Joi.string().min(2).max(2000).optional(),
    specialties: Joi.array().items(Joi.string()).max(10).optional(),
    experience: Joi.number().min(0).max(50).optional(),
    category: Joi.string().valid(...VALID_CATEGORIES).optional(),
  }),
};

export const rejectSchema = {
  body: Joi.object({
    reason: Joi.string().max(500).required(),
  }),
};

export const setFeaturedSchema = {
  body: Joi.object({
    isFeatured: Joi.boolean().required(),
    order: Joi.number().integer().min(0).optional(),
  }),
};

export const toggleActiveSchema = {
  body: Joi.object({
    isActive: Joi.boolean().required(),
  }),
};

// ─── Query Schemas ───────────────────────────────────────────────────────────────
export const portfolioGalleryQuerySchema = {
  query: Joi.object({
    category: Joi.string().max(50).optional(),
    page: Joi.number().integer().min(1).default(1),
    pageSize: Joi.number().integer().min(1).max(100).default(20),
  }),
};

export const searchSchema = {
  query: Joi.object({
    category: Joi.string().valid(...VALID_CATEGORIES).optional(),
    city: Joi.string().max(100).optional(),
    minRating: Joi.number().min(0).max(5).optional(),
    maxPrice: Joi.number().min(0).optional(),
    sortBy: Joi.string()
      .valid("rating_desc", "rating_asc", "price_desc", "price_asc", "newest", "popular")
      .optional(),
    page: Joi.number().integer().min(1).default(1),
    pageSize: Joi.number().integer().min(1).max(50).default(20),
  }),
};

export const availableSlotsSchema = {
  query: Joi.object({
    date: Joi.date().iso().required(),
    duration: Joi.number().integer().min(30).max(480).default(60),
  }),
};

export default {
  createProfileSchema,
  updateProfileSchema,
  addPortfolioSchema,
  portfolioItemParamSchema,
  adminUpdateAboutSchema,
  portfolioGalleryQuerySchema,
  searchSchema,
  availableSlotsSchema,
  professionalIdParamSchema,
  rejectSchema,
  setFeaturedSchema,
  toggleActiveSchema,
};
