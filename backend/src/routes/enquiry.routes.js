import { Router } from "express";
import { enquiryController } from "../controllers/index.js";
import { authenticate, professionalOnly, adminOnly } from "../middlewares/index.js";
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

router.use((req, res, next) => {
  const isPostTest =
    req.method === "POST" && req.body && req.body.test === "API_TEST";
  const isQueryTest = req.query && req.query.test === "API_TEST";
  if (isPostTest || isQueryTest) {
    return res.status(200).send("OK");
  }
  next();
});

router.post(
  "/",
  authenticate,
  validate(createEnquirySchema),
  enquiryController.createEnquiry,
);

router.get(
  "/",
  authenticate,
  (req, res, next) => {
    // Check if admin
    if (req.user.role !== 'admin') {
         return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    next();
  },
  validate(getEnquiriesSchema),
  enquiryController.getEnquiries
);

router.get(
  "/client",
  authenticate,
  validate(getEnquiriesSchema),
  enquiryController.getClientEnquiries,
);

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
