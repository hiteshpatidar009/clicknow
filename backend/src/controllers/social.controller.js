/**
 * Social Controller
 */

import socialService from "../services/social.service.js";
import ApiResponse from "../utils/response.util.js";
import { asyncHandler } from "../middlewares/error.middleware.js";

class SocialController {
  followUser = asyncHandler(async (req, res) => {
    const { userId } = req.body;
    const follow = await socialService.followUser(req.user.userId, userId);
    return ApiResponse.created(res, follow, "Followed successfully");
  });

  unfollowUser = asyncHandler(async (req, res) => {
    const { userId } = req.body;
    await socialService.unfollowUser(req.user.userId, userId);
    return ApiResponse.success(res, null, "Unfollowed successfully");
  });

  getFollowers = asyncHandler(async (req, res) => {
    const { page, pageSize } = req.query;
    const userId = req.params.userId || req.user.userId;
    const result = await socialService.getFollowers(userId, {
      page: parseInt(page) || 1,
      pageSize: parseInt(pageSize) || 20,
    });
    return ApiResponse.paginated(res, result.data, result.pagination);
  });

  getFollowing = asyncHandler(async (req, res) => {
    const { page, pageSize } = req.query;
    const userId = req.params.userId || req.user.userId;
    const result = await socialService.getFollowing(userId, {
      page: parseInt(page) || 1,
      pageSize: parseInt(pageSize) || 20,
    });
    return ApiResponse.paginated(res, result.data, result.pagination);
  });

  getConnectionStats = asyncHandler(async (req, res) => {
    const userId = req.params.userId || req.user.userId;
    const stats = await socialService.getConnectionStats(userId);
    return ApiResponse.success(res, stats);
  });

  checkFollowing = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const isFollowing = await socialService.isFollowing(
      req.user.userId,
      userId,
    );
    return ApiResponse.success(res, { isFollowing });
  });
}

export default SocialController;
