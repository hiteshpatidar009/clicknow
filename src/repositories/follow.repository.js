/**
 * Follow Repository
 */

import BaseRepository from "./base.repository.js";
import { COLLECTIONS } from "../utils/constants.util.js";

class FollowRepository extends BaseRepository {
  constructor() {
    super(COLLECTIONS.FOLLOWS);
  }

  async findFollowing(userId, options = {}) {
    return this.findPaginated({
      ...options,
      where: [{ field: "followerId", operator: "==", value: userId }],
    });
  }

  async findFollowers(userId, options = {}) {
    return this.findPaginated({
      ...options,
      where: [{ field: "followingId", operator: "==", value: userId }],
    });
  }

  async isFollowing(followerId, followingId) {
    const result = await this.findAll({
      where: [
        { field: "followerId", operator: "==", value: followerId },
        { field: "followingId", operator: "==", value: followingId },
      ],
      limit: 1,
    });
    return result.length > 0;
  }

  async getFollowingIds(userId) {
    const following = await this.findAll({
      where: [{ field: "followerId", operator: "==", value: userId }],
    });
    return following.map((f) => f.followingId);
  }

  async countFollowers(userId) {
    return this.count([{ field: "followingId", operator: "==", value: userId }]);
  }

  async countFollowing(userId) {
    return this.count([{ field: "followerId", operator: "==", value: userId }]);
  }

  async unfollow(followerId, followingId) {
    const follows = await this.findAll({
      where: [
        { field: "followerId", operator: "==", value: followerId },
        { field: "followingId", operator: "==", value: followingId },
      ],
    });
    if (follows.length > 0) {
      return this.delete(follows[0].id);
    }
    return false;
  }
}

export default new FollowRepository();
