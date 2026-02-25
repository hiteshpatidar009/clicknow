import mongoose from 'mongoose';
import { BOOKING_STATUS } from '../utils/constants.util.js';

const bookingSchema = new mongoose.Schema({
  // Using String (not ObjectId) so the schema accepts:
  // - Real MongoDB ObjectId strings (from registered users)
  // - Firebase UIDs
  // - Dev fallback IDs (e.g. 'dev-local-user')
  clientId: {
    type: String,
    required: true,
    index: true,
  },
  professionalId: {
    type: String,
    index: true,
  },
  enquiryId: {
    type: String,
  },
  bookingDate: {
    type: Date,
    required: true,
  },
  startTime: String,
  endTime: String,
  duration: Number, // in minutes
  eventType: String,
  eventDetails: {
    description: String,
    // ✅ Mixed: accepts plain string OR array of strings from frontend
    specialRequirements: { type: mongoose.Schema.Types.Mixed, default: null },
    guestCount: Number,
    serviceType: String,
    shootType: String,
    performanceType: String,
    artistType: String,
    genre: String,
    soundSystemRequired: Boolean,
    lightingRequired: Boolean,
    djStyle: String,
    equipmentRequired: String,
    decorStyle: String,
    theme: String,
    planningServices: [String],
    showType: String,
    interactivityLevel: String,
    setupTime: String,
    teardownTime: String,
  },
  location: {
    locationType: { type: String, default: 'client' }, // renamed to avoid conflict with Mongoose 'type'
    address: String,
    city: String,
    state: String,
    pincode: String,
    coordinates: {
      latitude: Number,
      longitude: Number,
    },
    instructions: String,
  },
  pricing: {
    pricingType: { type: String, default: 'hourly' }, // renamed to avoid conflict
    packageId: String,
    packageName: String,
    baseAmount: { type: Number, default: 0 },
    hours: { type: Number, default: 0 },
    additionalCharges: [{
      description: String,
      amount: Number,
    }],
    discounts: [{
      discountType: { type: String, enum: ['percentage', 'fixed'] }, // renamed
      value: Number,
      description: String,
    }],
    travelFee: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
    isPaid: { type: Boolean, default: false },
    paymentStatus: { type: String, default: 'pending' },
    paidAmount: { type: Number, default: 0 },
  },
  status: {
    type: String,
    enum: Object.values(BOOKING_STATUS),
    default: BOOKING_STATUS.PENDING,
  },
  statusReason: String,
  statusUpdatedAt: Date,
  notes: String,
  clientNotes: String,
  professionalNotes: String,
  // Admin assign fields
  assignedByAdminId: { type: String },
  assignedAt: Date,
  hasReview: { type: Boolean, default: false },
  reviewId: { type: String },
  reminderSent: { type: Boolean, default: false },
  reminderSentAt: Date,
  isDeleted: { type: Boolean, default: false },
  confirmedAt: Date,
  cancelledAt: Date,
  completedAt: Date,
  rejectedAt: Date,
}, {
  timestamps: true,
});

// Note: clientId and professionalId indexes are defined on the fields above with index:true
bookingSchema.index({ bookingDate: 1 });
bookingSchema.index({ status: 1 });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
