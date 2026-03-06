import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  professionalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Professional',
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  caption: String,
  media: [{
    type: { type: String, enum: ['image', 'video'], default: 'image' },
    url: String,
    thumbnailUrl: String,
    aspectRatio: Number,
  }],
  category: String,
  tags: [String],
  location: {
    name: String,
    coordinates: {
      latitude: Number,
      longitude: Number,
    },
  },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  likesCount: { type: Number, default: 0 },
  commentsCount: { type: Number, default: 0 },
  sharesCount: { type: Number, default: 0 },
  viewsCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  isPinned: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
}, {
  timestamps: true,
});

postSchema.index({ professionalId: 1 });
postSchema.index({ createdAt: -1 });

const Post = mongoose.model('Post', postSchema);
export default Post;
