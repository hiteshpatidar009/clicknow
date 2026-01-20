/**
 * Professional Routes
 * /api/v1/professionals
 */

import { Router } from "express";
import { professionalController } from "../controllers/index.js";
import {
  authenticate,
  optionalAuth,
  professionalOnly,
} from "../middlewares/index.js";
import { validate } from "../middlewares/validation.middleware.js";
import {
  createProfileSchema,
  updateProfileSchema,
  addPortfolioSchema,
  searchSchema,
  availableSlotsSchema,
  professionalIdParamSchema,
  toggleActiveSchema,
} from "../validators/professional.validator.js";

const router = Router();

// Public routes
router.get(
  "/",
  optionalAuth,
  validate(searchSchema),
  professionalController.search,
);
router.get("/featured", professionalController.getFeatured);
router.get("/top-rated", professionalController.getTopRated);
router.get("/category/:category", professionalController.getByCategory);
router.get(
  "/:id",
  validate(professionalIdParamSchema),
  professionalController.getById,
);
router.get(
  "/:id/availability",
  validate(professionalIdParamSchema),
  professionalController.getAvailability,
);
router.get(
  "/:id/availability/slots",
  validate({ ...professionalIdParamSchema, ...availableSlotsSchema }),
  professionalController.getAvailableSlots,
);
router.get(
  "/:id/reviews",
  validate(professionalIdParamSchema),
  professionalController.getReviews,
);

// Protected routes (for professionals)
router.post(
  "/",
  authenticate,
  validate(createProfileSchema),
  professionalController.createProfile,
);
router.get(
  "/me/profile",
  authenticate,
  professionalOnly,
  professionalController.getMyProfile,
);
router.put(
  "/me",
  authenticate,
  professionalOnly,
  validate(updateProfileSchema),
  professionalController.updateMyProfile,
);
router.put(
  "/me/active",
  authenticate,
  professionalOnly,
  validate(toggleActiveSchema),
  professionalController.toggleActive,
);
router.post(
  "/me/portfolio",
  authenticate,
  professionalOnly,
  validate(addPortfolioSchema),
  professionalController.addPortfolioItem,
);
router.delete(
  "/me/portfolio/:itemId",
  authenticate,
  professionalOnly,
  professionalController.removePortfolioItem,
);

export default router;
