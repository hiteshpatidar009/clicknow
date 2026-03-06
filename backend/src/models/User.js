import mongoose from 'mongoose';
import { USER_ROLES } from '../utils/constants.util.js';

const userSchema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    trim: true,
    default: undefined,
    set: (value) => {
      if (typeof value !== 'string') return undefined;
      const trimmed = value.trim();
      return trimmed || undefined;
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String, // Kept for legacy/backup, primarily using Firebase Auth
  },
  phone: {
    type: String,
  },
  firstName: {
    type: String,
    default: '',
  },
  lastName: {
    type: String,
    default: '',
  },
  displayName: {
    type: String,
  },
  avatar: {
    type: String,
  },
  role: {
    type: String,
    enum: Object.values(USER_ROLES),
    default: USER_ROLES.CLIENT,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  fcmToken: {
    type: String,
  },
  settings: {
    notifications: {
      push: { type: Boolean, default: true },
      email: { type: Boolean, default: false },
      whatsapp: { type: Boolean, default: true },
      marketing: { type: Boolean, default: true },
    },
    privacy: {
      showEmail: { type: Boolean, default: false },
      showPhone: { type: Boolean, default: false },
    },
    language: { type: String, default: 'en' },
    timezone: { type: String, default: 'UTC' },
  },
  searchTerms: [String],
  lastLoginAt: Date,
  verifiedAt: Date,
  deactivatedAt: Date,
}, {
  timestamps: true,
});

// Index for search
userSchema.index({ searchTerms: 1 });
userSchema.index(
  { firebaseUid: 1 },
  {
    unique: true,
    partialFilterExpression: {
      firebaseUid: { $exists: true, $type: 'string' },
    },
  },
);

const User = mongoose.model('User', userSchema);
export default User;
