/**
 * Feed Service
 * LinkedIn/Instagram-style feed system
 */

import {
  postRepository,
  commentRepository,
  followRepository,
  professionalRepository,
  userRepository,
} from "../repositories/index.js";
import PostModel from "../models/Post.js";
import CommentModel from "../models/Comment.js";
import notificationService from "./notification.service.js";
import Logger from "../utils/logger.util.js";

class FeedService {
  async createPost(userId, postData) {
    const { caption, media, category, tags, location } = postData;

    const professional = await professionalRepository.findByUserId(userId);

    const postModel = new PostModel({
      professionalId: professional?.id || null,
      userId,
      caption,
      media,
      category,
      tags,
      location,
    });

    const post = await postRepository.create(postModel.toJSON());

    Logger.logBusinessEvent("post_created", { postId: post.id, userId });

    return post;
  }

  async getFeed(userId, options = {}) {
    const followingIds = await followRepository.getFollowingIds(userId);

    let result;
    if (followingIds.length > 0 && options.feedType === "following") {
      result = await postRepository.getFollowingFeed(followingIds, options);
    } else {
      result = await postRepository.getFeed(options);
    }

    const enrichedPosts = await Promise.all(
      result.data.map((post) => this.enrichPost(post, userId))
    );

    return {
      data: enrichedPosts,
      pagination: result.pagination,
    };
  }

  async getPostById(postId, userId) {
    const post = await postRepository.findById(postId);
    if (!post) throw new Error("Post not found");

    await postRepository.incrementViews(postId);

    return this.enrichPost(post, userId);
  }

  async likePost(postId, userId) {
    const post = await postRepository.findById(postId);
    if (!post) throw new Error("Post not found");

    if (post.likes.includes(userId)) {
      return postRepository.unlikePost(postId, userId);
    }

    const updated = await postRepository.likePost(postId, userId);

    if (post.userId !== userId) {
      await notificationService.sendNotification(post.userId, {
        type: "post_like",
        title: "New Like",
        body: "Someone liked your post",
        data: { postId, action: "post_like" },
        channels: ["push"],
      });
    }

    return updated;
  }

  async addComment(postId, userId, text) {
    const post = await postRepository.findById(postId);
    if (!post) throw new Error("Post not found");

    const commentModel = new CommentModel({
      postId,
      userId,
      text,
    });

    const comment = await commentRepository.create(commentModel.toJSON());
    await postRepository.incrementComments(postId);

    if (post.userId !== userId) {
      await notificationService.sendNotification(post.userId, {
        type: "post_comment",
        title: "New Comment",
        body: text.substring(0, 100),
        data: { postId, commentId: comment.id, action: "post_comment" },
        channels: ["push"],
      });
    }

    return this.enrichComment(comment);
  }

  async getComments(postId, options = {}) {
    const result = await commentRepository.findByPostId(postId, options);

    const enrichedComments = await Promise.all(
      result.data.map((comment) => this.enrichComment(comment))
    );

    return {
      data: enrichedComments,
      pagination: result.pagination,
    };
  }

  async deletePost(postId, userId) {
    const post = await postRepository.findById(postId);
    if (!post) throw new Error("Post not found");
    if (post.userId !== userId) throw new Error("Unauthorized");

    return postRepository.update(postId, { isActive: false });
  }

  async enrichPost(post, currentUserId = null) {
    const user = await userRepository.findById(post.userId);
    const professional = post.professionalId
      ? await professionalRepository.findById(post.professionalId)
      : null;

    return {
      ...post,
      user: user
        ? {
            id: user.id,
            displayName: user.displayName,
            avatar: user.avatar,
          }
        : null,
      professional: professional
        ? {
            id: professional.id,
            businessName: professional.businessName,
            category: professional.category,
          }
        : null,
      isLiked: currentUserId ? post.likes.includes(currentUserId) : false,
    };
  }

  async enrichComment(comment) {
    const user = await userRepository.findById(comment.userId);

    return {
      ...comment,
      user: user
        ? {
            id: user.id,
            displayName: user.displayName,
            avatar: user.avatar,
          }
        : null,
    };
  }
}

export default new FeedService();
