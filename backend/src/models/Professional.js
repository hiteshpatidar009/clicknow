import mongoose from 'mongoose';
import { PROFESSIONAL_STATUS, PROFESSIONAL_CATEGORIES } from '../utils/constants.util.js';

function serialize(value) {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map(serialize);
  if (value instanceof Date) return value;
  if (typeof value === 'object') {
    if (typeof value.toHexString === 'function') return value.toString();
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = serialize(v);
    return out;
  }
  return value;
}

function toPlain(doc) {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : doc;
  const { _id, __v, ...rest } = obj;
  return serialize({ id: String(_id), ...rest });
}

function buildPublicProfile(json) {
  return {
    id: json.id,
    userId: json.userId,
    category: json.category,
    businessName: json.businessName,
    bio: json.bio,
    experience: json.experience || 0,
    specialties: json.specialties || [],
    pricing: json.pricing || {},
    location: json.location || {},
    serviceAreas: json.serviceAreas || [],
    contact: json.contact || {},
    portfolio: json.portfolio || [],
    rating: json.stats?.averageRating || 0,
    totalReviews: json.stats?.totalReviews || 0,
    totalBookings: json.stats?.totalBookings || 0,
    status: json.status,
    isFeatured: !!json.isFeatured,
    createdAt: json.createdAt,
    updatedAt: json.updatedAt,
  };
}

const professionalSchema = new mongoose.Schema({
  // String type to support MongoDB ObjectId strings, Firebase UIDs, and dev IDs
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  category: {
    type: String,
    // enum: Object.values(PROFESSIONAL_CATEGORIES), // Removing strict enum check to allow flexibility if needed, or keeping it strict? Let's keep it but handle potential new categories gracefully.
    default: PROFESSIONAL_CATEGORIES.PHOTOGRAPHER,
  },
  businessName: {
    type: String,
    required: true,
  },
  bio: String,
  experience: {
    type: Number,
    default: 0,
  },
  specialties: [String],
  portfolio: [{
    type: { type: String, default: 'image' },
    url: String,
    thumbnailUrl: String,
    title: String,
    description: String,
    category: String,
    order: Number,
    createdAt: { type: Date, default: Date.now }
  }],
  pricing: {
    hourlyRate: { type: Number, default: 0 },
    minimumHours: { type: Number, default: 1 },
    packages: [{
      name: String,
      description: String,
      price: Number,
      duration: Number, // in hours
      includes: [String],
      isPopular: Boolean,
      order: Number
    }],
    currency: { type: String, default: 'INR' },
    travelFee: {
      enabled: Boolean,
      perKm: Number,
      freeWithinKm: Number
    }
  },
  location: {
    address: String,
    city: String,
    state: String,
    country: String,
    pincode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  serviceAreas: [String], // List of cities/areas
  contact: {
    phone: String,
    email: String,
    website: String,
    instagram: String,
    facebook: String
  },
  personalDetails: {
    gender: String,
    dob: Date,
    languagesKnown: [String],
    permanentAddress: String
  },
  workDetails: {
    availableWorkingDays: [String],
    startTime: String,
    endTime: String,
    equipmentDetails: String,
    socialLinks: {
      instagram: String,
      website: String,
      googleMap: String
    }
  },
  documents: {
    aadharNumber: String,
    panNumber: String,
    gstNumber: String,
    aadharFront: String,
    aadharBack: String,
    panCard: String,
    policeVerificationCertificate: String,
    verificationStatus: {
      type: String,
      default: 'pending' 
    }
  },
  bankDetails: {
    accountNumber: String,
    ifscCode: String,
    bankName: String,
    accountHolderName: String,
    upiId: String
  },
  status: {
    type: String,
    enum: Object.values(PROFESSIONAL_STATUS),
    default: PROFESSIONAL_STATUS.PENDING,
  },
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  featuredOrder: { type: Number, default: 0 },
  isDeleted: { type: Boolean, default: false },
  stats: {
    totalBookings: { type: Number, default: 0 },
    completedBookings: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    profileViews: { type: Number, default: 0 },
    responseRate: { type: Number, default: 100 },
    responseTime: { type: Number, default: 0 }
  },
  settings: {
    instantBooking: { type: Boolean, default: false },
    autoAcceptBookings: { type: Boolean, default: false },
    showPricing: { type: Boolean, default: true },
    showContactInfo: { type: Boolean, default: false },
    notifyOnEnquiry: { type: Boolean, default: true },
    notifyOnBooking: { type: Boolean, default: true },
    notifyOnReview: { type: Boolean, default: true }
  },
  statusReason: String,
  statusUpdatedAt: Date,
  approvedAt: Date,
  rejectedAt: Date,
  verifiedAt: Date,
}, {
  timestamps: true,
});

professionalSchema.index({ 'location.coordinates': '2dsphere' });
professionalSchema.index({ category: 1 });
professionalSchema.index({ status: 1 });
professionalSchema.index({ 'pricing.hourlyRate': 1 });

professionalSchema.statics.forRegistration = function forRegistration(userId, category, data = {}) {
  return {
    toJSON() {
      return {
        userId,
        category,
        businessName: data.businessName,
        bio: data.bio || '',
        experience: data.experience || 0,
        specialties: data.specialties || [],
        pricing: data.pricing || {},
        location: data.location || {},
        serviceAreas: data.serviceAreas || [],
        contact: data.contact || {},
        personalDetails: data.personalDetails || {},
        workDetails: data.workDetails || {},
        documents: data.documents || {},
        bankDetails: data.bankDetails || {},
        status: PROFESSIONAL_STATUS.PENDING,
        isActive: true,
        isVerified: false,
        isFeatured: false,
        isDeleted: false,
      };
    },
  };
};

professionalSchema.statics.fromDocument = function fromDocument(doc) {
  const json = toPlain(doc);
  return {
    toJSON() {
      return json;
    },
    toPublicProfile() {
      return buildPublicProfile(json);
    },
    toFeaturedProfile() {
      const publicProfile = buildPublicProfile(json);
      return {
        ...publicProfile,
        featuredOrder: json.featuredOrder || 0,
      };
    },
  };
};

const Professional = mongoose.model('Professional', professionalSchema);
export default Professional;
