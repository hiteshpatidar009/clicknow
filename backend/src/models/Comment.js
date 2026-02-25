import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  parentCommentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null,
  },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  likesCount: { type: Number, default: 0 },
  repliesCount: { type: Number, default: 0 },
  isDeleted: { type: Boolean, default: false },
}, {
  timestamps: true,
});

commentSchema.index({ postId: 1 });
commentSchema.index({ parentCommentId: 1 });

const Comment = mongoose.model('Comment', commentSchema);
export default Comment;
