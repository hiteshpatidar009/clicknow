/**
 * Post Model
 * Social media post structure for feed
 */

class PostModel {
  constructor(data = {}) {
    this.id = data.id || null;
    this.professionalId = data.professionalId;
    this.userId = data.userId;
    this.caption = data.caption || "";
    this.media = data.media || [];
    this.category = data.category;
    this.tags = data.tags || [];
    this.location = data.location || null;
    this.likes = data.likes || [];
    this.likesCount = data.likesCount || 0;
    this.commentsCount = data.commentsCount || 0;
    this.sharesCount = data.sharesCount || 0;
    this.viewsCount = data.viewsCount || 0;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.isPinned = data.isPinned || false;
    this.createdAt = data.createdAt || null;
    this.updatedAt = data.updatedAt || null;
  }

  toJSON() {
    return {
      id: this.id,
      professionalId: this.professionalId,
      userId: this.userId,
      caption: this.caption,
      media: this.media,
      category: this.category,
      tags: this.tags,
      location: this.location,
      likes: this.likes,
      likesCount: this.likesCount,
      commentsCount: this.commentsCount,
      sharesCount: this.sharesCount,
      viewsCount: this.viewsCount,
      isActive: this.isActive,
      isPinned: this.isPinned,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static fromDocument(doc) {
    return new PostModel(doc);
  }
}

export default PostModel;
