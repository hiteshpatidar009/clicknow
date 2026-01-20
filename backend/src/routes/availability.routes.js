/**
 * Availability Routes
 * /api/v1/availability
 */

import { Router } from "express";
import { availabilityController } from "../controllers/index.js";
import { authenticate, professionalOnly } from "../middlewares/index.js";
import { validate } from "../middlewares/validation.middleware.js";
import {
  updateWeeklyScheduleSchema,
  blockedDateSchema,
  specialDateSchema,
  bufferTimeSchema,
  bookingSettingsSchema,
  availableSlotsSchema,
  monthlyCalendarSchema,
  checkSlotSchema,
  dateParamSchema,
} from "../validators/availability.validator.js";

const router = Router();

// All routes require professional authentication
router.use(authenticate, professionalOnly);

router.get("/", availabilityController.getMyAvailability);
router.put(
  "/schedule",
  validate(updateWeeklyScheduleSchema),
  availabilityController.updateWeeklySchedule,
);
router.post(
  "/blocked-dates",
  validate(blockedDateSchema),
  availabilityController.addBlockedDate,
);
router.delete(
  "/blocked-dates/:date",
  validate(dateParamSchema),
  availabilityController.removeBlockedDate,
);
router.post(
  "/special-dates",
  validate(specialDateSchema),
  availabilityController.addSpecialDate,
);
router.delete(
  "/special-dates/:date",
  validate(dateParamSchema),
  availabilityController.removeSpecialDate,
);
router.put(
  "/buffer-time",
  validate(bufferTimeSchema),
  availabilityController.updateBufferTime,
);
router.put(
  "/settings",
  validate(bookingSettingsSchema),
  availabilityController.updateBookingSettings,
);
router.get(
  "/slots",
  validate(availableSlotsSchema),
  availabilityController.getAvailableSlots,
);
router.get(
  "/calendar",
  validate(monthlyCalendarSchema),
  availabilityController.getMonthlyCalendar,
);
router.get(
  "/check",
  validate(checkSlotSchema),
  availabilityController.checkSlotAvailability,
);

export default router;
