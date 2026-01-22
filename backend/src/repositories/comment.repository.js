/**
 * Comment Repository
 */

import BaseRepository from "./base.repository.js";
import { COLLECTIONS } from "../utils/constants.util.js";

class CommentRepository extends BaseRepository {
  constructor() {
    super(COLLECTIONS.COMMENTS);
  }

  async findByPostId(postId, options = {}) {
    return this.findPaginated({
      ...options,
      where: [
        { field: "postId", operator: "==", value: postId },
        { field: "parentCommentId", operator: "==", value: null },
        { field: "isDeleted", operator: "==", value: false },
      ],
      orderBy: "createdAt",
      orderDirection: "desc",
    });
  }

  async findReplies(commentId, options = {}) {
    return this.findPaginated({
      ...options,
      where: [
        { field: "parentCommentId", operator: "==", value: commentId },
        { field: "isDeleted", operator: "==", value: false },
      ],
      orderBy: "createdAt",
      orderDirection: "asc",
    });
  }

  async likeComment(commentId, userId) {
    await this.addToArray(commentId, "likes", userId);
    return this.incrementField(commentId, "likesCount", 1);
  }

  async unlikeComment(commentId, userId) {
    await this.removeFromArray(commentId, "likes", userId);
    return this.incrementField(commentId, "likesCount", -1);
  }
}

export default new CommentRepository();
