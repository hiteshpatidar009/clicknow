/**
 * Booking Routes
 * /api/v1/bookings
 */

import { Router } from "express";
import { bookingController } from "../controllers/index.js";
import { authenticate, professionalOnly } from "../middlewares/index.js";
import { validate } from "../middlewares/validation.middleware.js";
import {
  createBookingSchema,
  rescheduleSchema,
  cancelSchema,
  rejectSchema,
  getBookingsSchema,
  calendarSchema,
  bookingIdParamSchema,
  dateParamSchema,
} from "../validators/booking.validator.js";

const router = Router();

// Client routes
router.post(
  "/",
  authenticate,
  validate(createBookingSchema),
  bookingController.createBooking,
);
router.get(
  "/client",
  authenticate,
  validate(getBookingsSchema),
  bookingController.getClientBookings,
);

// Professional routes
router.get(
  "/professional",
  authenticate,
  professionalOnly,
  validate(getBookingsSchema),
  bookingController.getProfessionalBookings,
);
router.get(
  "/professional/upcoming",
  authenticate,
  professionalOnly,
  bookingController.getUpcomingBookings,
);
router.get(
  "/professional/calendar",
  authenticate,
  professionalOnly,
  validate(calendarSchema),
  bookingController.getCalendar,
);
router.get(
  "/date/:date",
  authenticate,
  professionalOnly,
  validate(dateParamSchema),
  bookingController.getBookingsForDate,
);
router.put(
  "/:id/confirm",
  authenticate,
  professionalOnly,
  validate(bookingIdParamSchema),
  bookingController.confirmBooking,
);
router.put(
  "/:id/reject",
  authenticate,
  professionalOnly,
  validate({ ...bookingIdParamSchema, ...rejectSchema }),
  bookingController.rejectBooking,
);
router.put(
  "/:id/complete",
  authenticate,
  professionalOnly,
  validate(bookingIdParamSchema),
  bookingController.completeBooking,
);

// Shared routes
router.get(
  "/:id",
  authenticate,
  validate(bookingIdParamSchema),
  bookingController.getById,
);
router.put(
  "/:id/cancel",
  authenticate,
  validate({ ...bookingIdParamSchema, ...cancelSchema }),
  bookingController.cancelBooking,
);
router.put(
  "/:id/reschedule",
  authenticate,
  validate({ ...bookingIdParamSchema, ...rescheduleSchema }),
  bookingController.rescheduleBooking,
);

export default router;
