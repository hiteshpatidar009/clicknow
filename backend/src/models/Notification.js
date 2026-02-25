import mongoose from 'mongoose';
import { NOTIFICATION_TYPES } from '../utils/constants.util.js';

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: Object.values(NOTIFICATION_TYPES),
    default: NOTIFICATION_TYPES.SYSTEM,
  },
  title: String,
  body: String,
  data: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
  },
  imageUrl: String,
  actionUrl: String,
  channels: [{ type: String, enum: ['push', 'in_app', 'email', 'whatsapp'] }],
  isRead: { type: Boolean, default: false },
  readAt: Date,
  isSent: { type: Boolean, default: false },
  sentVia: {
    push: Date,
    email: Date,
    whatsapp: Date,
    in_app: Date,
  },
  isDeleted: { type: Boolean, default: false },
}, {
  timestamps: true,
});

notificationSchema.index({ userId: 1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
