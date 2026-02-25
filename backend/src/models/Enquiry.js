import mongoose from 'mongoose';
import { ENQUIRY_STATUS } from '../utils/constants.util.js';

const enquirySchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  professionalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Professional',
  },
  eventType: String,
  eventDate: Date,
  eventDetails: String,
  location: {
    address: String,
    city: String,
    state: String,
    pincode: String,
  },
  budget: {
    min: Number,
    max: Number,
    currency: { type: String, default: 'INR' }
  },
  requirements: String,
  contactPreference: {
    type: String,
    default: 'in_app', // 'phone', 'email', 'whatsapp', 'in_app'
  },
  status: {
    type: String,
    enum: Object.values(ENQUIRY_STATUS),
    default: ENQUIRY_STATUS.PENDING,
  },
  statusNote: String,
  statusUpdatedAt: Date,
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
  },
  isDeleted: { type: Boolean, default: false },
  respondedAt: Date,
  convertedAt: Date,
  closedAt: Date,
}, {
  timestamps: true,
});

enquirySchema.index({ clientId: 1 });
enquirySchema.index({ professionalId: 1 });
enquirySchema.index({ status: 1 });

const Enquiry = mongoose.model('Enquiry', enquirySchema);
export default Enquiry;
