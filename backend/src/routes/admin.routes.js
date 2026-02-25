import { Router } from "express";
import adminController from "../controllers/admin.controller.js";
import {
  professionalController,
  reviewController,
  enquiryController,
  bookingController,
  settingsController,
} from "../controllers/index.js";
import { authenticate, adminOnly } from "../middlewares/index.js";
import { validate } from "../middlewares/validation.middleware.js";
import {
  professionalIdParamSchema,
  portfolioItemParamSchema,
  adminUpdateAboutSchema,
  addPortfolioSchema,
  setFeaturedSchema,
} from "../validators/professional.validator.js";
import {
  reviewIdParamSchema,
  rejectReviewSchema,
} from "../validators/review.validator.js";

const router = Router();

// Apply authentication and admin check to all routes
router.use(authenticate, adminOnly);

// Test Bypass (from original code)
router.use((req, res, next) => {
  const isPostTest =
    req.method === "POST" && req.body && req.body.test === "API_TEST";
  const isQueryTest = req.query.test === "API_TEST";
  if (isPostTest || isQueryTest) {
    return res.status(200).send("OK");
  }
  next();
});

// Dashboard & Reports
router.get("/dashboard", adminController.getDashboardStats);
router.get("/reports/revenue", adminController.getRevenueReport);
router.get("/settings", settingsController.getSettings);
router.put("/settings", settingsController.updateSettings);

// User Management
router.get("/users", adminController.getUsers);

// Professional Management
router.get("/professionals", adminController.getAllProfessionals);
router.get("/professionals/pending", professionalController.getPendingApprovals);
router.get("/professionals/statistics", professionalController.getStatistics);
router.put("/professionals/:id/verify", adminController.verifyProfessional);
router.put(
  "/professionals/:id/suspend",
  adminController.suspendProfessional,
);
router.put(
  "/professionals/:id/reactivate",
  adminController.reactivateProfessional,
);
router.put(
  "/professionals/:id/featured",
  validate({ ...professionalIdParamSchema, ...setFeaturedSchema }),
  professionalController.setFeatured,
);
router.post(
  "/professionals/:id/portfolio",
  validate({ ...professionalIdParamSchema, ...addPortfolioSchema }),
  adminController.addProfessionalPortfolioItem,
);
router.delete(
  "/professionals/:id/portfolio/:itemId",
  validate(portfolioItemParamSchema),
  adminController.removeProfessionalPortfolioItem,
);
router.put(
  "/professionals/:id/about",
  validate({ ...professionalIdParamSchema, ...adminUpdateAboutSchema }),
  adminController.updateProfessionalAbout,
);

// Booking Management
router.get("/bookings", adminController.getBookings);
router.get("/bookings/statistics", bookingController.getStatistics);

// Review Management
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

// Enquiry Management
router.get("/enquiries", enquiryController.getEnquiries);
router.get("/enquiries/statistics", enquiryController.getStatistics);

export default router;
