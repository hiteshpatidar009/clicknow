import { bookingService, availabilityService } from "../services/index.js";
import { professionalService } from "../services/index.js";
import ApiResponse from "../utils/response.util.js";
import { asyncHandler } from "../middlewares/error.middleware.js";

class BookingController {
  /**
   * POST /api/v1/bookings
   */
  createBooking = asyncHandler(async (req, res) => {
    const booking = await bookingService.createBooking(
      req.user.userId,
      req.body,
    );
    return ApiResponse.created(res, booking, "Booking request submitted");
  });

  /**
   * GET /api/v1/bookings/:id
   */
  getById = asyncHandler(async (req, res) => {
    const booking = await bookingService.getById(req.params.id);

    const myProfile = await professionalService
      .getByUserId(req.user.userId)
      .catch(() => null);
    const isProfessional = myProfile && booking.professionalId === myProfile.id;
    const isClient = booking.clientId === req.user.userId;

    if (!isProfessional && !isClient && req.user.role !== "admin") {
      return ApiResponse.forbidden(res, "Unauthorized to view this booking");
    }

    return ApiResponse.success(res, booking);
  });

  /**
   * GET /api/v1/bookings/client (Get client's bookings)
   */
  getClientBookings = asyncHandler(async (req, res) => {
    const { status, page, pageSize } = req.query;
    const result = await bookingService.getClientBookings(req.user.userId, {
      status,
      page: parseInt(page) || 1,
      pageSize: parseInt(pageSize) || 20,
    });
    return ApiResponse.paginated(res, result.data, result.pagination);
  });

  /**
   * GET /api/v1/bookings/professional (Get professional's bookings)
   */
  getProfessionalBookings = asyncHandler(async (req, res) => {
    const myProfile = await professionalService.getByUserId(req.user.userId);
    const { status, page, pageSize } = req.query;
    const result = await bookingService.getProfessionalBookings(myProfile.id, {
      status,
      page: parseInt(page) || 1,
      pageSize: parseInt(pageSize) || 20,
    });
    return ApiResponse.paginated(res, result.data, result.pagination);
  });

  /**
   * GET /api/v1/bookings/professional/upcoming
   */
  getUpcomingBookings = asyncHandler(async (req, res) => {
    const myProfile = await professionalService.getByUserId(req.user.userId);
    const { limit } = req.query;
    const result = await bookingService.getUpcomingBookings(myProfile.id, {
      limit: parseInt(limit) || 10,
    });
    return ApiResponse.success(res, result.data);
  });

  /**
   * PUT /api/v1/bookings/:id/confirm (Professional confirms)
   */
  confirmBooking = asyncHandler(async (req, res) => {
    const booking = await bookingService.confirmBooking(
      req.params.id,
      req.user.userId,
    );
    return ApiResponse.success(res, booking, "Booking confirmed");
  });

  /**
   * PUT /api/v1/bookings/:id/reject (Professional rejects)
   */
  rejectBooking = asyncHandler(async (req, res) => {
    const { reason } = req.body;
    const booking = await bookingService.rejectBooking(
      req.params.id,
      req.user.userId,
      reason,
    );
    return ApiResponse.success(res, booking, "Booking rejected");
  });

  /**
   * PUT /api/v1/bookings/:id/cancel
   */
  cancelBooking = asyncHandler(async (req, res) => {
    const { reason } = req.body;
    const booking = await bookingService.cancelBooking(
      req.params.id,
      req.user.userId,
      reason,
    );
    return ApiResponse.success(res, booking, "Booking cancelled");
  });

  /**
   * PUT /api/v1/bookings/:id/reschedule
   */
  rescheduleBooking = asyncHandler(async (req, res) => {
    const { bookingDate, startTime, endTime } = req.body;
    const booking = await bookingService.rescheduleBooking(
      req.params.id,
      req.user.userId,
      { bookingDate, startTime, endTime },
    );
    return ApiResponse.success(res, booking, "Booking rescheduled");
  });

  /**
   * PUT /api/v1/bookings/:id/complete (Professional marks complete)
   */
  completeBooking = asyncHandler(async (req, res) => {
    const booking = await bookingService.completeBooking(req.params.id);
    return ApiResponse.success(res, booking, "Booking marked as complete");
  });

  /**
   * GET /api/v1/bookings/professional/calendar
   */
  getCalendar = asyncHandler(async (req, res) => {
    const myProfile = await professionalService.getByUserId(req.user.userId);
    const { year, month } = req.query;
    const calendar = await availabilityService.getMonthlyAvailability(
      myProfile.id,
      parseInt(year) || new Date().getFullYear(),
      parseInt(month) || new Date().getMonth() + 1,
    );
    return ApiResponse.success(res, calendar);
  });

  /**
   * GET /api/v1/bookings/date/:date (Professional's bookings for a date)
   */
  getBookingsForDate = asyncHandler(async (req, res) => {
    const myProfile = await professionalService.getByUserId(req.user.userId);
    const bookings = await bookingService.getBookingsForDate(
      myProfile.id,
      req.params.date,
    );
    return ApiResponse.success(res, bookings);
  });

  /**
   * GET /api/v1/admin/bookings
   */
  getAllBookings = asyncHandler(async (req, res) => {
    const { status, startDate, endDate, page, pageSize } = req.query;

    return ApiResponse.success(res, []);
  });

  /**
   * GET /api/v1/admin/bookings/statistics
   */
  getStatistics = asyncHandler(async (req, res) => {
    const stats = await bookingService.getStatistics();
    return ApiResponse.success(res, stats);
  });
  /**
   * GET /api/v1/bookings/:id/matches (Admin)
   */
  getMatchingProfessionals = asyncHandler(async (req, res) => {
    const booking = await bookingService.getById(req.params.id);
    const matches = await professionalService.findMatchesForBooking(booking);
    return ApiResponse.success(res, matches);
  });

  /**
   * PUT /api/v1/bookings/:id/assign (Admin)
   */
  assignProfessional = asyncHandler(async (req, res) => {
    const { professionalId } = req.body;
    if (!professionalId) {
        return ApiResponse.badRequest(res, "Professional ID is required");
    }
    const booking = await bookingService.assignProfessional(
      req.params.id,
      professionalId,
      req.user.userId
    );
    return ApiResponse.success(res, booking, "Professional assigned successfully");
  });
}

export default BookingController;
