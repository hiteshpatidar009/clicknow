/**
 * Social Service
 * Follow/unfollow and social connections
 */

import {
  followRepository,
  userRepository,
  professionalRepository,
} from "../repositories/index.js";
import FollowModel from "../models/Follow.js";
import notificationService from "./notification.service.js";
import Logger from "../utils/logger.util.js";

class SocialService {
  async followUser(followerId, followingId) {
    if (followerId === followingId) {
      throw new Error("Cannot follow yourself");
    }

    const isAlreadyFollowing = await followRepository.isFollowing(
      followerId,
      followingId
    );

    if (isAlreadyFollowing) {
      throw new Error("Already following");
    }

    const followModel = new FollowModel({
      followerId,
      followingId,
    });

    const follow = await followRepository.create(followModel.toJSON());

    await notificationService.sendNotification(followingId, {
      type: "new_follower",
      title: "New Follower",
      body: "Someone started following you",
      data: { followerId, action: "new_follower" },
      channels: ["push"],
    });

    Logger.logBusinessEvent("user_followed", { followerId, followingId });

    return follow;
  }

  async unfollowUser(followerId, followingId) {
    const result = await followRepository.unfollow(followerId, followingId);

    Logger.logBusinessEvent("user_unfollowed", { followerId, followingId });

    return result;
  }

  async getFollowers(userId, options = {}) {
    const result = await followRepository.findFollowers(userId, options);

    const enrichedFollowers = await Promise.all(
      result.data.map(async (follow) => {
        const user = await userRepository.findById(follow.followerId);
        return {
          ...follow,
          user: user
            ? {
                id: user.id,
                displayName: user.displayName,
                avatar: user.avatar,
              }
            : null,
        };
      })
    );

    return {
      data: enrichedFollowers,
      pagination: result.pagination,
    };
  }

  async getFollowing(userId, options = {}) {
    const result = await followRepository.findFollowing(userId, options);

    const enrichedFollowing = await Promise.all(
      result.data.map(async (follow) => {
        const user = await userRepository.findById(follow.followingId);
        return {
          ...follow,
          user: user
            ? {
                id: user.id,
                displayName: user.displayName,
                avatar: user.avatar,
              }
            : null,
        };
      })
    );

    return {
      data: enrichedFollowing,
      pagination: result.pagination,
    };
  }

  async getConnectionStats(userId) {
    const [followersCount, followingCount] = await Promise.all([
      followRepository.countFollowers(userId),
      followRepository.countFollowing(userId),
    ]);

    return {
      followersCount,
      followingCount,
    };
  }

  async isFollowing(followerId, followingId) {
    return followRepository.isFollowing(followerId, followingId);
  }
}

export default new SocialService();
