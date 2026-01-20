/**
 * Review Controller
 * Handles review endpoints
 */

import { reviewService } from "../services/index.js";
import ApiResponse from "../utils/response.util.js";
import { asyncHandler } from "../middlewares/error.middleware.js";

class ReviewController {
  /**
   * POST /api/v1/reviews
   */
  createReview = asyncHandler(async (req, res) => {
    const review = await reviewService.createReview(req.user.userId, req.body);
    return ApiResponse.created(res, review, "Review submitted");
  });

  /**
   * GET /api/v1/reviews/:id
   */
  getById = asyncHandler(async (req, res) => {
    const review = await reviewService.getById(req.params.id);
    return ApiResponse.success(res, review);
  });

  /**
   * GET /api/v1/reviews/my (Client's reviews)
   */
  getMyReviews = asyncHandler(async (req, res) => {
    const { page, pageSize } = req.query;
    const result = await reviewService.getClientReviews(req.user.userId, {
      page: parseInt(page) || 1,
      pageSize: parseInt(pageSize) || 20,
    });
    return ApiResponse.paginated(res, result.data, result.pagination);
  });

  /**
   * POST /api/v1/reviews/:id/response (Professional responds)
   */
  addResponse = asyncHandler(async (req, res) => {
    const { response } = req.body;
    const review = await reviewService.addResponse(
      req.params.id,
      req.user.userId,
      response,
    );
    return ApiResponse.success(res, review, "Response added");
  });

  /**
   * POST /api/v1/reviews/:id/report
   */
  reportReview = asyncHandler(async (req, res) => {
    const { reason } = req.body;
    const review = await reviewService.reportReview(
      req.params.id,
      req.user.userId,
      reason,
    );
    return ApiResponse.success(res, review, "Review reported");
  });

  /**
   * POST /api/v1/reviews/:id/helpful
   */
  markHelpful = asyncHandler(async (req, res) => {
    const review = await reviewService.markHelpful(
      req.params.id,
      req.user.userId,
    );
    return ApiResponse.success(res, review);
  });

  // Admin endpoints

  /**
   * GET /api/v1/admin/reviews/pending
   */
  getPendingReviews = asyncHandler(async (req, res) => {
    const { page, pageSize } = req.query;
    const result = await reviewService.getPendingReviews({
      page: parseInt(page) || 1,
      pageSize: parseInt(pageSize) || 20,
    });
    return ApiResponse.paginated(res, result.data, result.pagination);
  });

  /**
   * GET /api/v1/admin/reviews/reported
   */
  getReportedReviews = asyncHandler(async (req, res) => {
    const { page, pageSize } = req.query;
    const result = await reviewService.getReportedReviews({
      page: parseInt(page) || 1,
      pageSize: parseInt(pageSize) || 20,
    });
    return ApiResponse.paginated(res, result.data, result.pagination);
  });

  /**
   * PUT /api/v1/admin/reviews/:id/approve
   */
  approveReview = asyncHandler(async (req, res) => {
    const review = await reviewService.approveReview(
      req.params.id,
      req.user.userId,
    );
    return ApiResponse.success(res, review, "Review approved");
  });

  /**
   * PUT /api/v1/admin/reviews/:id/reject
   */
  rejectReview = asyncHandler(async (req, res) => {
    const { reason } = req.body;
    const review = await reviewService.rejectReview(
      req.params.id,
      req.user.userId,
      reason,
    );
    return ApiResponse.success(res, review, "Review rejected");
  });

  /**
   * DELETE /api/v1/admin/reviews/:id
   */
  removeReview = asyncHandler(async (req, res) => {
    const { reason } = req.body;
    const review = await reviewService.removeReview(
      req.params.id,
      req.user.userId,
      reason,
    );
    return ApiResponse.success(res, review, "Review removed");
  });

  /**
   * GET /api/v1/admin/reviews/statistics
   */
  getStatistics = asyncHandler(async (req, res) => {
    const stats = await reviewService.getStatistics();
    return ApiResponse.success(res, stats);
  });
}

export default new ReviewController();
