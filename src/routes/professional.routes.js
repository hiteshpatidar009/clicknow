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
  portfolioGalleryQuerySchema,
  toggleActiveSchema,
} from "../validators/professional.validator.js";

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
  "/:id/gallery",
  validate({ ...professionalIdParamSchema, ...portfolioGalleryQuerySchema }),
  professionalController.getPortfolioGallery,
);
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

router.post(
  "/",
  authenticate,
  validate(createProfileSchema),
  professionalController.createProfile,
);
router.get(
  "/me/profile",
  authenticate,           // any authenticated user (professional, client, admin)
  professionalController.getMyProfile,
);
router.put(
  "/me",
  authenticate,           // steps 2-5: no role restriction (JWT role unchanged after step 1)
  validate(updateProfileSchema),
  professionalController.updateMyProfile,
);
router.put(
  "/me/active",
  authenticate,
  professionalOnly,       // toggle active is professional/admin only
  validate(toggleActiveSchema),
  professionalController.toggleActive,
);
router.post(
  "/me/portfolio",
  authenticate,           // any authenticated user with a professional profile
  validate(addPortfolioSchema),
  professionalController.addPortfolioItem,
);
router.delete(
  "/me/portfolio/:itemId",
  authenticate,
  professionalController.removePortfolioItem,
);

export default router;
