/**
 * Availability Controller
 * Handles availability management endpoints
 */

import { availabilityService, professionalService } from "../services/index.js";
import ApiResponse from "../utils/response.util.js";
import { asyncHandler } from "../middlewares/error.middleware.js";

class AvailabilityController {
  /**
   * GET /api/v1/availability (Get my availability)
   */
  getMyAvailability = asyncHandler(async (req, res) => {
    const myProfile = await professionalService.getByUserId(req.user.userId);
    const availability = await availabilityService.getAvailability(
      myProfile.id,
    );
    return ApiResponse.success(res, availability);
  });

  /**
   * PUT /api/v1/availability/schedule
   */
  updateWeeklySchedule = asyncHandler(async (req, res) => {
    const myProfile = await professionalService.getByUserId(req.user.userId);
    const availability = await availabilityService.updateWeeklySchedule(
      myProfile.id,
      req.body,
    );
    return ApiResponse.success(res, availability, "Schedule updated");
  });

  /**
   * POST /api/v1/availability/blocked-dates
   */
  addBlockedDate = asyncHandler(async (req, res) => {
    const myProfile = await professionalService.getByUserId(req.user.userId);
    const availability = await availabilityService.addBlockedDate(
      myProfile.id,
      req.body,
    );
    return ApiResponse.success(res, availability, "Date blocked");
  });

  /**
   * DELETE /api/v1/availability/blocked-dates/:date
   */
  removeBlockedDate = asyncHandler(async (req, res) => {
    const myProfile = await professionalService.getByUserId(req.user.userId);
    const availability = await availabilityService.removeBlockedDate(
      myProfile.id,
      req.params.date,
    );
    return ApiResponse.success(res, availability, "Blocked date removed");
  });

  /**
   * POST /api/v1/availability/special-dates
   */
  addSpecialDate = asyncHandler(async (req, res) => {
    const myProfile = await professionalService.getByUserId(req.user.userId);
    const availability = await availabilityService.addSpecialDate(
      myProfile.id,
      req.body,
    );
    return ApiResponse.success(res, availability, "Special date added");
  });

  /**
   * DELETE /api/v1/availability/special-dates/:date
   */
  removeSpecialDate = asyncHandler(async (req, res) => {
    const myProfile = await professionalService.getByUserId(req.user.userId);
    const availability = await availabilityService.removeSpecialDate(
      myProfile.id,
      req.params.date,
    );
    return ApiResponse.success(res, availability, "Special date removed");
  });

  /**
   * PUT /api/v1/availability/buffer-time
   */
  updateBufferTime = asyncHandler(async (req, res) => {
    const myProfile = await professionalService.getByUserId(req.user.userId);
    const { bufferTime } = req.body;
    const availability = await availabilityService.updateBufferTime(
      myProfile.id,
      bufferTime,
    );
    return ApiResponse.success(res, availability, "Buffer time updated");
  });

  /**
   * PUT /api/v1/availability/settings
   */
  updateBookingSettings = asyncHandler(async (req, res) => {
    const myProfile = await professionalService.getByUserId(req.user.userId);
    const availability = await availabilityService.updateBookingSettings(
      myProfile.id,
      req.body,
    );
    return ApiResponse.success(res, availability, "Booking settings updated");
  });

  /**
   * GET /api/v1/availability/slots
   */
  getAvailableSlots = asyncHandler(async (req, res) => {
    const myProfile = await professionalService.getByUserId(req.user.userId);
    const { date, duration } = req.query;
    const slots = await availabilityService.getAvailableSlots(
      myProfile.id,
      date,
      parseInt(duration) || 60,
    );
    return ApiResponse.success(res, slots);
  });

  /**
   * GET /api/v1/availability/calendar
   */
  getMonthlyCalendar = asyncHandler(async (req, res) => {
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
   * GET /api/v1/availability/check
   */
  checkSlotAvailability = asyncHandler(async (req, res) => {
    const myProfile = await professionalService.getByUserId(req.user.userId);
    const { date, startTime, endTime } = req.query;
    const isAvailable = await availabilityService.isSlotAvailable(
      myProfile.id,
      date,
      startTime,
      endTime,
    );
    return ApiResponse.success(res, { available: isAvailable });
  });
}

export default new AvailabilityController();
