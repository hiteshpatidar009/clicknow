/**
 * Comment Model
 */

class CommentModel {
  constructor(data = {}) {
    this.id = data.id || null;
    this.postId = data.postId;
    this.userId = data.userId;
    this.text = data.text;
    this.parentCommentId = data.parentCommentId || null;
    this.likes = data.likes || [];
    this.likesCount = data.likesCount || 0;
    this.repliesCount = data.repliesCount || 0;
    this.isDeleted = data.isDeleted || false;
    this.createdAt = data.createdAt || null;
    this.updatedAt = data.updatedAt || null;
  }

  toJSON() {
    return {
      id: this.id,
      postId: this.postId,
      userId: this.userId,
      text: this.text,
      parentCommentId: this.parentCommentId,
      likes: this.likes,
      likesCount: this.likesCount,
      repliesCount: this.repliesCount,
      isDeleted: this.isDeleted,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static fromDocument(doc) {
    return new CommentModel(doc);
  }
}

export default CommentModel;
