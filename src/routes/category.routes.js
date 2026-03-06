
import { Router } from "express";
import categoryController from "../controllers/category.controller.js";
import { authenticate, adminOnly } from "../middlewares/index.js";

const router = Router();

// Public routes
router.get("/", categoryController.getAll);
router.get("/:slug", categoryController.getBySlug);

// Admin routes
router.post("/", authenticate, adminOnly, categoryController.create);
router.put("/:id", authenticate, adminOnly, categoryController.update);
router.delete("/:id", authenticate, adminOnly, categoryController.delete);

export default router;
