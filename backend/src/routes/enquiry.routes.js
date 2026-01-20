/**
 * Enquiry Routes
 * /api/v1/enquiries
 */

import { Router } from "express";
import { enquiryController } from "../controllers/index.js";
import { authenticate, professionalOnly } from "../middlewares/index.js";
import { validate } from "../middlewares/validation.middleware.js";
import {
  createEnquirySchema,
  respondSchema,
  convertToBookingSchema,
  closeEnquirySchema,
  getEnquiriesSchema,
  enquiryIdParamSchema,
} from "../validators/enquiry.validator.js";

const router = Router();

// Client routes
router.post(
  "/",
  authenticate,
  validate(createEnquirySchema),
  enquiryController.createEnquiry,
);
router.get(
  "/client",
  authenticate,
  validate(getEnquiriesSchema),
  enquiryController.getClientEnquiries,
);

// Professional routes
router.get(
  "/professional",
  authenticate,
  professionalOnly,
  validate(getEnquiriesSchema),
  enquiryController.getProfessionalEnquiries,
);
router.get(
  "/professional/pending",
  authenticate,
  professionalOnly,
  validate(getEnquiriesSchema),
  enquiryController.getPendingEnquiries,
);
router.put(
  "/:id/respond",
  authenticate,
  professionalOnly,
  validate({ ...enquiryIdParamSchema, ...respondSchema }),
  enquiryController.respondToEnquiry,
);
router.put(
  "/:id/convert",
  authenticate,
  professionalOnly,
  validate({ ...enquiryIdParamSchema, ...convertToBookingSchema }),
  enquiryController.convertToBooking,
);

// Shared routes
router.get(
  "/:id",
  authenticate,
  validate(enquiryIdParamSchema),
  enquiryController.getById,
);
router.put(
  "/:id/close",
  authenticate,
  validate({ ...enquiryIdParamSchema, ...closeEnquirySchema }),
  enquiryController.closeEnquiry,
);

export default router;
