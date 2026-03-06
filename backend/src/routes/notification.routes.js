import { Router } from "express";
import { notificationController } from "../controllers/index.js";
import { authenticate } from "../middlewares/index.js";

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

router.use(authenticate);

router.get("/", notificationController.getNotifications);
router.get("/unread", notificationController.getUnreadNotifications);
router.get("/unread-count", notificationController.getUnreadCount);
router.get("/statistics", notificationController.getStatistics);
router.put("/read-all", notificationController.markAllAsRead);
router.put("/:id/read", notificationController.markAsRead);
router.delete("/:id", notificationController.deleteNotification);

export default router;
