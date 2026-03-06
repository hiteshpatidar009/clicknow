/**
 * Feed Controller
 */

import feedService from "../services/feed.service.js";
import ApiResponse from "../utils/response.util.js";
import { asyncHandler } from "../middlewares/error.middleware.js";

class FeedController {
  createPost = asyncHandler(async (req, res) => {
    const post = await feedService.createPost(req.user.userId, req.body);
    return ApiResponse.created(res, post, "Post created");
  });

  getFeed = asyncHandler(async (req, res) => {
    const { feedType, page, pageSize } = req.query;
    const result = await feedService.getFeed(req.user.userId, {
      feedType,
      page: parseInt(page) || 1,
      pageSize: parseInt(pageSize) || 20,
    });
    return ApiResponse.paginated(res, result.data, result.pagination);
  });

  getPostById = asyncHandler(async (req, res) => {
    const post = await feedService.getPostById(req.params.id, req.user.userId);
    return ApiResponse.success(res, post);
  });

  likePost = asyncHandler(async (req, res) => {
    const post = await feedService.likePost(req.params.id, req.user.userId);
    return ApiResponse.success(res, post);
  });

  addComment = asyncHandler(async (req, res) => {
    const { text } = req.body;
    const comment = await feedService.addComment(
      req.params.id,
      req.user.userId,
      text,
    );
    return ApiResponse.created(res, comment, "Comment added");
  });

  getComments = asyncHandler(async (req, res) => {
    const { page, pageSize } = req.query;
    const result = await feedService.getComments(req.params.id, {
      page: parseInt(page) || 1,
      pageSize: parseInt(pageSize) || 20,
    });
    return ApiResponse.paginated(res, result.data, result.pagination);
  });

  deletePost = asyncHandler(async (req, res) => {
    await feedService.deletePost(req.params.id, req.user.userId);
    return ApiResponse.success(res, null, "Post deleted");
  });
}

export default FeedController;
