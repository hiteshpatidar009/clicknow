/**
 * Review Routes
 * /api/v1/reviews
 */

import { Router } from "express";
import { reviewController } from "../controllers/index.js";
import { authenticate, professionalOnly } from "../middlewares/index.js";
import { validate } from "../middlewares/validation.middleware.js";
import {
  createReviewSchema,
  addResponseSchema,
  reportReviewSchema,
  getReviewsSchema,
  reviewIdParamSchema,
} from "../validators/review.validator.js";

const router = Router();

// Client routes
router.post(
  "/",
  authenticate,
  validate(createReviewSchema),
  reviewController.createReview,
);
router.get(
  "/my",
  authenticate,
  validate(getReviewsSchema),
  reviewController.getMyReviews,
);

// Shared routes
router.get("/:id", validate(reviewIdParamSchema), reviewController.getById);
router.post(
  "/:id/report",
  authenticate,
  validate({ ...reviewIdParamSchema, ...reportReviewSchema }),
  reviewController.reportReview,
);
router.post(
  "/:id/helpful",
  authenticate,
  validate(reviewIdParamSchema),
  reviewController.markHelpful,
);

// Professional routes
router.post(
  "/:id/response",
  authenticate,
  professionalOnly,
  validate({ ...reviewIdParamSchema, ...addResponseSchema }),
  reviewController.addResponse,
);

export default router;
