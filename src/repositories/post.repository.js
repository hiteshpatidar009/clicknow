/**
 * Post Repository
 */

import BaseRepository from "./base.repository.js";
import { COLLECTIONS } from "../utils/constants.util.js";

class PostRepository extends BaseRepository {
  constructor() {
    super(COLLECTIONS.POSTS);
  }

  async findByProfessionalId(professionalId, options = {}) {
    return this.findPaginated({
      ...options,
      where: [
        { field: "professionalId", operator: "==", value: professionalId },
        { field: "isActive", operator: "==", value: true },
      ],
      orderBy: "createdAt",
      orderDirection: "desc",
    });
  }

  async getFeed(options = {}) {
    return this.findPaginated({
      ...options,
      where: [{ field: "isActive", operator: "==", value: true }],
      orderBy: "createdAt",
      orderDirection: "desc",
    });
  }

  async getFollowingFeed(followingIds, options = {}) {
    return this.findPaginated({
      ...options,
      where: [
        { field: "userId", operator: "in", value: followingIds },
        { field: "isActive", operator: "==", value: true },
      ],
      orderBy: "createdAt",
      orderDirection: "desc",
    });
  }

  async likePost(postId, userId) {
    await this.addToArray(postId, "likes", userId);
    return this.incrementField(postId, "likesCount", 1);
  }

  async unlikePost(postId, userId) {
    await this.removeFromArray(postId, "likes", userId);
    return this.incrementField(postId, "likesCount", -1);
  }

  async incrementViews(postId) {
    return this.incrementField(postId, "viewsCount", 1);
  }

  async incrementComments(postId) {
    return this.incrementField(postId, "commentsCount", 1);
  }

  async decrementComments(postId) {
    return this.incrementField(postId, "commentsCount", -1);
  }
}

export default new PostRepository();
