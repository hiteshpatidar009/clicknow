import { searchService } from "../services/index.js";
import ApiResponse from "../utils/response.util.js";
import { asyncHandler } from "../middlewares/error.middleware.js";

class SearchController {
  /**
   * GET /api/v1/search/professionals
   */
  searchProfessionals = asyncHandler(async (req, res) => {
    const {
      q,
      category,
      specialty,
      city,
      state,
      lat,
      lng,
      radius,
      minRating,
      maxPrice,
      minPrice,
      sortBy,
      page,
      pageSize,
    } = req.query;

    const result = await searchService.searchProfessionals(
      {
        query: q,
        category,
        specialty,
        city,
        state,
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
        radius: parseFloat(radius),
        minRating: parseFloat(minRating),
        maxPrice: parseFloat(maxPrice),
        minPrice: parseFloat(minPrice),
        sortBy,
      },
      {
        page: parseInt(page) || 1,
        pageSize: parseInt(pageSize) || 20,
      },
    );

    return ApiResponse.paginated(res, result.data, result.pagination, null, {
      filters: result.filters,
    });
  });

  /**
   * GET /api/v1/search/autocomplete
   */
  autocomplete = asyncHandler(async (req, res) => {
    const { q, type } = req.query;
    const suggestions = await searchService.getAutocompleteSuggestions(q, type);
    return ApiResponse.success(res, suggestions);
  });
}

export default SearchController;
