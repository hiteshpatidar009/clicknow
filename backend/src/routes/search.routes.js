/**
 * Search Routes
 * /api/v1/search
 */

import { Router } from "express";
import { searchController } from "../controllers/index.js";
import { optionalAuth, searchLimiter } from "../middlewares/index.js";
import { validate } from "../middlewares/validation.middleware.js";
import {
  searchProfessionalsSchema,
  autocompleteSchema,
} from "../validators/search.validator.js";

const router = Router();

router.get(
  "/professionals",
  searchLimiter,
  optionalAuth,
  validate(searchProfessionalsSchema),
  searchController.searchProfessionals,
);
router.get(
  "/autocomplete",
  searchLimiter,
  validate(autocompleteSchema),
  searchController.autocomplete,
);

export default router;
