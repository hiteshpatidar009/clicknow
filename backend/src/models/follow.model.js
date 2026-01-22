/**
 * Follow Model
 */

class FollowModel {
  constructor(data = {}) {
    this.id = data.id || null;
    this.followerId = data.followerId;
    this.followingId = data.followingId;
    this.createdAt = data.createdAt || null;
  }

  toJSON() {
    return {
      id: this.id,
      followerId: this.followerId,
      followingId: this.followingId,
      createdAt: this.createdAt,
    };
  }

  static fromDocument(doc) {
    return new FollowModel(doc);
  }
}

export default FollowModel;
