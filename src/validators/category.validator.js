import Joi from "joi";

export const createCategorySchema = {
  body: Joi.object({
    name: Joi.string().required().min(2).max(50),
    slug: Joi.string().alphanum().min(2).max(50).optional(),
    description: Joi.string().max(500).optional(),
    icon: Joi.string().uri().optional(),
    image: Joi.string().uri().optional(),
    isActive: Joi.boolean().optional(),
    displayOrder: Joi.number().integer().optional(),
  }),
};

export const updateCategorySchema = {
  body: Joi.object({
    name: Joi.string().min(2).max(50).optional(),
    slug: Joi.string().alphanum().min(2).max(50).optional(),
    description: Joi.string().max(500).optional(),
    icon: Joi.string().uri().optional(),
    image: Joi.string().uri().optional(),
    isActive: Joi.boolean().optional(),
    displayOrder: Joi.number().integer().optional(),
  }),
};
