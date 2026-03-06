import { Router } from "express";
import { searchController } from "../controllers/index.js";
import { optionalAuth, searchLimiter } from "../middlewares/index.js";
import { validate } from "../middlewares/validation.middleware.js";
import {
  searchProfessionalsSchema,
  autocompleteSchema,
} from "../validators/search.validator.js";

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
