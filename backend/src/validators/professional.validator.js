import Joi from "joi";
import { PROFESSIONAL_CATEGORIES } from "../utils/constants.util.js";

const locationSchema = Joi.object({
  address: Joi.string().max(500).optional(),
  city: Joi.string().max(100).required(),
  state: Joi.string().max(100).required(),
  country: Joi.string().max(100).default("India"),
  pincode: Joi.string()
    .pattern(/^\d{6}$/)
    .optional(),
  coordinates: Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
  }).optional(),
});

const pricingSchema = Joi.object({
  hourlyRate: Joi.number().min(0).optional(),
  minimumHours: Joi.number().min(1).default(1),
  currency: Joi.string().valid("INR", "USD").default("INR"),
  packages: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().max(100).required(),
        description: Joi.string().max(500).optional(),
        price: Joi.number().min(0).required(),
        duration: Joi.number().min(1).required(),
        deliverables: Joi.array().items(Joi.string()).optional(),
      }),
    )
    .optional(),
});

const contactSchema = Joi.object({
  email: Joi.string().email().optional(),
  phone: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .optional(),
  whatsapp: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .optional(),
  website: Joi.string().uri().optional(),
  instagram: Joi.string().max(100).optional(),
  facebook: Joi.string().max(100).optional(),
});

export const createProfileSchema = {
  body: Joi.object({
    category: Joi.string()
      .valid(...Object.values(PROFESSIONAL_CATEGORIES))
      .required(),
    businessName: Joi.string().min(2).max(100).required(),
    bio: Joi.string().min(50).max(2000).required(),
    specialties: Joi.array().items(Joi.string()).min(1).max(10).required(),
    experience: Joi.number().min(0).max(50).optional(),
    pricing: pricingSchema.optional(),
    location: locationSchema.required(),
    serviceAreas: Joi.array().items(Joi.string()).max(20).optional(),
    contact: contactSchema.optional(),
  }),
};

export const updateProfileSchema = {
  body: Joi.object({
    businessName: Joi.string().min(2).max(100).optional(),
    bio: Joi.string().min(50).max(2000).optional(),
    specialties: Joi.array().items(Joi.string()).min(1).max(10).optional(),
    experience: Joi.number().min(0).max(50).optional(),
    pricing: pricingSchema.optional(),
    location: locationSchema.optional(),
    serviceAreas: Joi.array().items(Joi.string()).max(20).optional(),
    contact: contactSchema.optional(),
    settings: Joi.object({
      instantBooking: Joi.boolean().optional(),
      autoReply: Joi.boolean().optional(),
      autoReplyMessage: Joi.string().max(500).optional(),
    }).optional(),
  }),
};

export const addPortfolioSchema = {
  body: Joi.object({
    id: Joi.string().required(),
    type: Joi.string().valid("image", "video").default("image"),
    url: Joi.string().uri().required(),
    thumbnailUrl: Joi.string().uri().optional(),
    title: Joi.string().max(100).optional(),
    description: Joi.string().max(500).optional(),
    category: Joi.string().max(50).optional(),
  }),
};

export const searchSchema = {
  query: Joi.object({
    category: Joi.string()
      .valid(...Object.values(PROFESSIONAL_CATEGORIES))
      .optional(),
    city: Joi.string().max(100).optional(),
    minRating: Joi.number().min(0).max(5).optional(),
    maxPrice: Joi.number().min(0).optional(),
    sortBy: Joi.string()
      .valid(
        "rating_desc",
        "rating_asc",
        "price_desc",
        "price_asc",
        "newest",
        "popular",
      )
      .optional(),
    page: Joi.number().integer().min(1).default(1),
    pageSize: Joi.number().integer().min(1).max(50).default(20),
  }),
};

export const availableSlotsSchema = {
  query: Joi.object({
    date: Joi.date().iso().required(),
    duration: Joi.number().integer().min(30).max(480).default(60),
  }),
};

export const professionalIdParamSchema = {
  params: Joi.object({
    id: Joi.string().required(),
  }),
};

export const rejectSchema = {
  body: Joi.object({
    reason: Joi.string().max(500).required(),
  }),
};

export const setFeaturedSchema = {
  body: Joi.object({
    isFeatured: Joi.boolean().required(),
    order: Joi.number().integer().min(0).optional(),
  }),
};

export const toggleActiveSchema = {
  body: Joi.object({
    isActive: Joi.boolean().required(),
  }),
};

export default {
  createProfileSchema,
  updateProfileSchema,
  addPortfolioSchema,
  searchSchema,
  availableSlotsSchema,
  professionalIdParamSchema,
  rejectSchema,
  setFeaturedSchema,
  toggleActiveSchema,
};
