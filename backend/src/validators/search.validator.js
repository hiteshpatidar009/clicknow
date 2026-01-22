import Joi from "joi";
import { PROFESSIONAL_CATEGORIES } from "../utils/constants.util.js";

export const searchProfessionalsSchema = {
  query: Joi.object({
    q: Joi.string().max(200).optional(),
    category: Joi.string()
      .valid(...Object.values(PROFESSIONAL_CATEGORIES))
      .optional(),
    specialty: Joi.string().max(50).optional(),
    city: Joi.string().max(100).optional(),
    state: Joi.string().max(100).optional(),
    lat: Joi.number().min(-90).max(90).optional(),
    lng: Joi.number().min(-180).max(180).optional(),
    radius: Joi.number().min(1).max(500).optional(),
    minRating: Joi.number().min(0).max(5).optional(),
    maxPrice: Joi.number().min(0).optional(),
    minPrice: Joi.number().min(0).optional(),
    sortBy: Joi.string()
      .valid(
        "rating_desc",
        "rating_asc",
        "price_desc",
        "price_asc",
        "distance",
        "popular",
        "newest",
      )
      .optional(),
    page: Joi.number().integer().min(1).default(1),
    pageSize: Joi.number().integer().min(1).max(50).default(20),
  }),
};

export const autocompleteSchema = {
  query: Joi.object({
    q: Joi.string().min(2).max(100).required(),
    type: Joi.string()
      .valid("all", "professionals", "specialties", "locations")
      .default("all"),
  }),
};

export default {
  searchProfessionalsSchema,
  autocompleteSchema,
};
