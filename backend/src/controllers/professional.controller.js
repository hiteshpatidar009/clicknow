import {
  professionalService,
  availabilityService,
  reviewService,
} from "../services/index.js";
import ApiResponse from "../utils/response.util.js";
import { asyncHandler } from "../middlewares/error.middleware.js";

class ProfessionalController {
  /**
   * POST /api/v1/professionals
   */
  createProfile = asyncHandler(async (req, res) => {
    const professional = await professionalService.createProfile(
      req.user.userId,
      req.body,
    );
    return ApiResponse.created(
      res,
      professional,
      "Profile created successfully. Pending approval.",
    );
  });

  /**
   * GET /api/v1/professionals/me
   */
  getMyProfile = asyncHandler(async (req, res) => {
    const professional = await professionalService.getByUserId(req.user.userId);
    return ApiResponse.success(res, professional);
  });

  /**
   * PUT /api/v1/professionals/me
   */
  updateMyProfile = asyncHandler(async (req, res) => {
    const myProfile = await professionalService.getByUserId(req.user.userId);
    const professional = await professionalService.updateProfile(
      myProfile.id,
      req.body,
    );
    return ApiResponse.success(res, professional, "Profile updated");
  });

  /**
   * GET /api/v1/professionals/:id
   */
  getById = asyncHandler(async (req, res) => {
    const professional = await professionalService.getPublicProfile(
      req.params.id,
    );
    return ApiResponse.success(res, professional);
  });

  /**
   * GET /api/v1/professionals
   */
  search = asyncHandler(async (req, res) => {
    const { category, city, minRating, maxPrice, sortBy, page, pageSize } =
      req.query;
    const result = await professionalService.search(
      {
        category,
        city,
        minRating: parseFloat(minRating),
        maxPrice: parseFloat(maxPrice),
      },
      { sortBy, page: parseInt(page) || 1, pageSize: parseInt(pageSize) || 20 },
    );
    return ApiResponse.paginated(res, result.data, result.pagination);
  });

  /**
   * GET /api/v1/professionals/featured
   */
  getFeatured = asyncHandler(async (req, res) => {
    const { limit } = req.query;
    const result = await professionalService.getFeatured({
      limit: parseInt(limit) || 10,
    });
    return ApiResponse.success(res, result.data);
  });

  /**
   * GET /api/v1/professionals/category/:category
   */
  getByCategory = asyncHandler(async (req, res) => {
    const { page, pageSize } = req.query;
    const result = await professionalService.getByCategory(
      req.params.category,
      { page: parseInt(page) || 1, pageSize: parseInt(pageSize) || 20 },
    );
    return ApiResponse.paginated(res, result.data, result.pagination);
  });

  /**
   * GET /api/v1/professionals/top-rated
   */
  getTopRated = asyncHandler(async (req, res) => {
    const { limit } = req.query;
    const professionals = await professionalService.getTopRated(
      parseInt(limit) || 10,
    );
    return ApiResponse.success(res, professionals);
  });

  /**
   * POST /api/v1/professionals/me/portfolio
   */
  addPortfolioItem = asyncHandler(async (req, res) => {
    const myProfile = await professionalService.getByUserId(req.user.userId);
    const professional = await professionalService.addPortfolioItem(
      myProfile.id,
      req.body,
    );
    return ApiResponse.success(res, professional, "Portfolio item added");
  });

  /**
   * DELETE /api/v1/professionals/me/portfolio/:itemId
   */
  removePortfolioItem = asyncHandler(async (req, res) => {
    const myProfile = await professionalService.getByUserId(req.user.userId);
    const professional = await professionalService.removePortfolioItem(
      myProfile.id,
      req.params.itemId,
    );
    return ApiResponse.success(res, professional, "Portfolio item removed");
  });

  /**
   * GET /api/v1/professionals/:id/availability
   */
  getAvailability = asyncHandler(async (req, res) => {
    const availability = await availabilityService.getAvailability(
      req.params.id,
    );
    return ApiResponse.success(res, availability);
  });

  /**
   * GET /api/v1/professionals/:id/availability/slots
   */
  getAvailableSlots = asyncHandler(async (req, res) => {
    const { date, duration } = req.query;
    const slots = await availabilityService.getAvailableSlots(
      req.params.id,
      date,
      parseInt(duration) || 60,
    );
    return ApiResponse.success(res, slots);
  });

  /**
   * GET /api/v1/professionals/:id/reviews
   */
  getReviews = asyncHandler(async (req, res) => {
    const { page, pageSize } = req.query;
    const result = await reviewService.getProfessionalReviews(req.params.id, {
      page: parseInt(page) || 1,
      pageSize: parseInt(pageSize) || 20,
    });
    return ApiResponse.paginated(res, result.data, result.pagination);
  });

  /**
   * PUT /api/v1/professionals/me/active (Toggle active status)
   */
  toggleActive = asyncHandler(async (req, res) => {
    const myProfile = await professionalService.getByUserId(req.user.userId);
    const { isActive } = req.body;
    const professional = await professionalService.setActive(
      myProfile.id,
      isActive,
    );
    return ApiResponse.success(
      res,
      professional,
      `Profile ${isActive ? "activated" : "deactivated"}`,
    );
  });

  /**
   * GET /api/v1/admin/professionals/pending
   */
  getPendingApprovals = asyncHandler(async (req, res) => {
    const { page, pageSize } = req.query;
    const result = await professionalService.getPendingApprovals({
      page: parseInt(page) || 1,
      pageSize: parseInt(pageSize) || 20,
    });
    return ApiResponse.paginated(res, result.data, result.pagination);
  });

  /**
   * PUT /api/v1/admin/professionals/:id/approve
   */
  approve = asyncHandler(async (req, res) => {
    const professional = await professionalService.approve(
      req.params.id,
      req.user.userId,
    );
    return ApiResponse.success(res, professional, "Professional approved");
  });

  /**
   * PUT /api/v1/admin/professionals/:id/reject
   */
  reject = asyncHandler(async (req, res) => {
    const { reason } = req.body;
    const professional = await professionalService.reject(
      req.params.id,
      req.user.userId,
      reason,
    );
    return ApiResponse.success(res, professional, "Professional rejected");
  });

  /**
   * PUT /api/v1/admin/professionals/:id/featured
   */
  setFeatured = asyncHandler(async (req, res) => {
    const { isFeatured, order } = req.body;
    const professional = await professionalService.setFeatured(
      req.params.id,
      isFeatured,
      order,
    );
    return ApiResponse.success(
      res,
      professional,
      `Featured status ${isFeatured ? "enabled" : "disabled"}`,
    );
  });

  /**
   * GET /api/v1/admin/professionals/statistics
   */
  getStatistics = asyncHandler(async (req, res) => {
    const stats = await professionalService.getStatistics();
    return ApiResponse.success(res, stats);
  });
}

export default ProfessionalController;
