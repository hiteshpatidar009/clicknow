/**
 * Admin Routes
 * /api/v1/admin
 */

import { Router } from "express";
import {
  professionalController,
  reviewController,
  userController,
  bookingController,
  enquiryController,
} from "../controllers/index.js";
import { authenticate, adminOnly } from "../middlewares/index.js";
import { validate } from "../middlewares/validation.middleware.js";
import {
  professionalIdParamSchema,
  rejectSchema,
  setFeaturedSchema,
} from "../validators/professional.validator.js";
import {
  reviewIdParamSchema,
  rejectReviewSchema,
} from "../validators/review.validator.js";

const router = Router();

// All admin routes require admin authentication
router.use(authenticate, adminOnly);

// Dashboard statistics
router.get("/statistics", async (req, res) => {
  // Aggregate statistics from all services
  const [userStats, professionalStats, bookingStats, reviewStats] =
    await Promise.all([
      userController.getStatistics(req, res),
      professionalController.getStatistics(req, res),
      bookingController.getStatistics(req, res),
      reviewController.getStatistics(req, res),
    ]);

  // Note: Each controller sends its own response
  // This route would need custom implementation to aggregate
});

// Professional management
router.get(
  "/professionals/pending",
  professionalController.getPendingApprovals,
);
router.get("/professionals/statistics", professionalController.getStatistics);
router.put(
  "/professionals/:id/approve",
  validate(professionalIdParamSchema),
  professionalController.approve,
);
router.put(
  "/professionals/:id/reject",
  validate({ ...professionalIdParamSchema, ...rejectSchema }),
  professionalController.reject,
);
router.put(
  "/professionals/:id/featured",
  validate({ ...professionalIdParamSchema, ...setFeaturedSchema }),
  professionalController.setFeatured,
);

// Review management
router.get("/reviews/pending", reviewController.getPendingReviews);
router.get("/reviews/reported", reviewController.getReportedReviews);
router.get("/reviews/statistics", reviewController.getStatistics);
router.put(
  "/reviews/:id/approve",
  validate(reviewIdParamSchema),
  reviewController.approveReview,
);
router.put(
  "/reviews/:id/reject",
  validate({ ...reviewIdParamSchema, ...rejectReviewSchema }),
  reviewController.rejectReview,
);
router.delete(
  "/reviews/:id",
  validate(reviewIdParamSchema),
  reviewController.removeReview,
);

// Booking statistics
router.get("/bookings", bookingController.getAllBookings);
router.get("/bookings/statistics", bookingController.getStatistics);

// Enquiry statistics
router.get("/enquiries/statistics", enquiryController.getStatistics);

export default router;
