import { enquiryService, professionalService } from "../services/index.js";
import ApiResponse from "../utils/response.util.js";
import { asyncHandler } from "../middlewares/error.middleware.js";
import Logger from "../utils/logger.util.js";
import { ServiceUnavailableError } from "../utils/errors.util.js";

class EnquiryController {
  /**
   * POST /api/v1/enquiries
   */
  createEnquiry = asyncHandler(async (req, res) => {
    const enquiry = await enquiryService.createEnquiry(
      req.user.userId,
      req.body,
    );
    return ApiResponse.created(res, enquiry, "Enquiry submitted");
  });

  /**
   * GET /api/v1/enquiries/:id
   */
  getById = asyncHandler(async (req, res) => {
    const enquiry = await enquiryService.getById(req.params.id);

    const myProfile = await professionalService
      .getByUserId(req.user.userId)
      .catch(() => null);
    const isProfessional = myProfile && enquiry.professionalId === myProfile.id;
    const isClient = enquiry.clientId === req.user.userId;

    if (!isProfessional && !isClient && req.user.role !== "admin") {
      return ApiResponse.forbidden(res, "Unauthorized");
    }

    return ApiResponse.success(res, enquiry);
  });

  /**
   * GET /api/v1/enquiries/client (Client's enquiries)
   */
  getClientEnquiries = asyncHandler(async (req, res) => {
    const { page, pageSize } = req.query;
    const result = await enquiryService.getClientEnquiries(req.user.userId, {
      page: parseInt(page) || 1,
      pageSize: parseInt(pageSize) || 20,
    });
    return ApiResponse.paginated(res, result.data, result.pagination);
  });

  /**
   * GET /api/v1/enquiries/professional (Professional's enquiries)
   */
  getProfessionalEnquiries = asyncHandler(async (req, res) => {
    const myProfile = await professionalService.getByUserId(req.user.userId);
    const { page, pageSize } = req.query;
    const result = await enquiryService.getProfessionalEnquiries(myProfile.id, {
      page: parseInt(page) || 1,
      pageSize: parseInt(pageSize) || 20,
    });
    return ApiResponse.paginated(res, result.data, result.pagination);
  });

  /**
   * GET /api/v1/enquiries/professional/pending
   */
  getPendingEnquiries = asyncHandler(async (req, res) => {
    const myProfile = await professionalService.getByUserId(req.user.userId);
    const { page, pageSize } = req.query;
    const result = await enquiryService.getPendingEnquiries(myProfile.id, {
      page: parseInt(page) || 1,
      pageSize: parseInt(pageSize) || 20,
    });
    return ApiResponse.paginated(res, result.data, result.pagination);
  });

  /**
   * PUT /api/v1/enquiries/:id/respond
   */
  respondToEnquiry = asyncHandler(async (req, res) => {
    const { note } = req.body;
    const enquiry = await enquiryService.respondToEnquiry(
      req.params.id,
      req.user.userId,
      note,
    );
    return ApiResponse.success(res, enquiry, "Response sent");
  });

  /**
   * PUT /api/v1/enquiries/:id/close
   */
  closeEnquiry = asyncHandler(async (req, res) => {
    const { note } = req.body;
    const enquiry = await enquiryService.closeEnquiry(req.params.id, note);
    return ApiResponse.success(res, enquiry, "Enquiry closed");
  });

  /**
   * PUT /api/v1/enquiries/:id/convert
   */
  convertToBooking = asyncHandler(async (req, res) => {
    const { bookingId } = req.body;
    const enquiry = await enquiryService.convertToBooking(
      req.params.id,
      bookingId,
    );
    return ApiResponse.success(res, enquiry, "Converted to booking");
  });

  /**
   * GET /api/v1/admin/enquiries/statistics
   */
  getStatistics = asyncHandler(async (req, res) => {
    const stats = await enquiryService.getStatistics();
    return ApiResponse.success(res, stats);
  });

  /**
   * GET /api/v1/enquiries (Admin list)
   */
  getEnquiries = asyncHandler(async (req, res) => {
    const { status, professionalId, clientId, startDate, endDate, page, pageSize, sortBy, sortOrder } = req.query;
    const parsedPage = parseInt(page) || 1;
    const parsedPageSize = parseInt(pageSize) || 20;

    try {
      const result = await enquiryService.getAllEnquiries({
        status,
        professionalId,
        clientId,
        startDate,
        endDate,
        page: parsedPage,
        pageSize: parsedPageSize,
        orderBy: sortBy,
        orderDirection: sortOrder
      });

      return ApiResponse.paginated(res, result.data, result.pagination);
    } catch (error) {
      if (shouldUseDevMockFallback() && isServiceUnavailableError(error)) {
        Logger.warn("Using mock enquiries due to Firestore unavailability");
        const mockEnquiries = [
          { id: "e-1", clientName: "Aarav Shah", professionalName: "Lens Studio", subject: "Wedding package", status: "pending", createdAt: new Date().toISOString() },
          { id: "e-2", clientName: "Riya Kapoor", professionalName: "Candid Frames", subject: "Engagement shoot", status: "responded", createdAt: new Date().toISOString() },
        ];
        return ApiResponse.paginated(res, mockEnquiries, {
          page: parsedPage,
          pageSize: parsedPageSize,
          totalCount: mockEnquiries.length,
          totalPages: 1,
          hasMore: false,
          nextCursor: null,
        });
      }
      throw error;
    }
  });
}

function shouldUseDevMockFallback() {
  return (
    process.env.NODE_ENV !== "production" &&
    (process.env.AUTH_DEV_FALLBACK || "true").toLowerCase() === "true"
  );
}

function isServiceUnavailableError(error) {
  return (
    error instanceof ServiceUnavailableError ||
    error?.statusCode === 503 ||
    (error?.message || "").toLowerCase().includes("quota exceeded")
  );
}

export default EnquiryController;
