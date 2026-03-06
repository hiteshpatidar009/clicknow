import mongoose from 'mongoose';
import { REVIEW_STATUS } from '../utils/constants.util.js';

const reviewSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  professionalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Professional',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  title: String,
  content: String,
  response: {
    text: String,
    createdAt: Date,
  },
  responseAt: Date,
  status: {
    type: String,
    enum: Object.values(REVIEW_STATUS),
    default: REVIEW_STATUS.PENDING,
  },
  moderationReason: String,
  isReported: { type: Boolean, default: false },
  reportedAt: Date,
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reportReason: String,
  helpfulCount: { type: Number, default: 0 },
  helpfulVotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isDeleted: { type: Boolean, default: false },
}, {
  timestamps: true,
});

reviewSchema.index({ professionalId: 1 });
reviewSchema.index({ bookingId: 1 });
reviewSchema.index({ status: 1 });

const Review = mongoose.model('Review', reviewSchema);
export default Review;
