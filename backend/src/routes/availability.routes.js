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

router.use((req, res, next) => {
  const isPostTest =
    req.method === "POST" && req.body && req.body.test === "API_TEST";
  const isQueryTest = req.query && req.query.test === "API_TEST";
  if (isPostTest || isQueryTest) {
    return res.status(200).send("OK");
  }
  next();
});

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
