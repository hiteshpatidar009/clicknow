import { Router } from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import professionalRoutes from "./professional.routes.js";
import bookingRoutes from "./booking.routes.js";
import reviewRoutes from "./review.routes.js";
import availabilityRoutes from "./availability.routes.js";
import enquiryRoutes from "./enquiry.routes.js";
import chatRoutes from "./chat.routes.js";
import notificationRoutes from "./notification.routes.js";
import searchRoutes from "./search.routes.js";
import uploadRoutes from "./upload.routes.js";
import adminRoutes from "./admin.routes.js";
import feedRoutes from "./feed.routes.js";
import socialRoutes from "./social.routes.js";
import categoryRoutes from "./category.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/professionals", professionalRoutes);
router.use("/bookings", bookingRoutes);
router.use("/reviews", reviewRoutes);
router.use("/availability", availabilityRoutes);
router.use("/enquiries", enquiryRoutes);
router.use("/chats", chatRoutes);
router.use("/notifications", notificationRoutes);
router.use("/search", searchRoutes);
router.use("/uploads", uploadRoutes);
router.use("/admin", adminRoutes);
router.use("/feed", feedRoutes);
router.use("/social", socialRoutes);
router.use("/categories", categoryRoutes);

router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "API is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

export default router;
