import Joi from "joi";

export const updateProfileSchema = {
  body: Joi.object({
    firstName: Joi.string().min(2).max(50).optional(),
    lastName: Joi.string().min(2).max(50).optional(),
    displayName: Joi.string().min(2).max(100).optional(),
    avatar: Joi.string().uri().optional(),
    phone: Joi.string()
      .pattern(/^\+?[1-9]\d{1,14}$/)
      .optional(),
    settings: Joi.object({
      language: Joi.string().valid("en", "hi").optional(),
      currency: Joi.string().valid("INR", "USD").optional(),
      notifications: Joi.object({
        push: Joi.boolean().optional(),
        email: Joi.boolean().optional(),
        whatsapp: Joi.boolean().optional(),
      }).optional(),
    }).optional(),
  }),
};

export const updateNotificationSettingsSchema = {
  body: Joi.object({
    push: Joi.boolean().optional(),
    email: Joi.boolean().optional(),
    whatsapp: Joi.boolean().optional(),
    bookingUpdates: Joi.boolean().optional(),
    promotions: Joi.boolean().optional(),
    reminders: Joi.boolean().optional(),
  }),
};

export const updateFcmTokenSchema = {
  body: Joi.object({
    fcmToken: Joi.string().required(),
  }),
};

export const getUsersSchema = {
  query: Joi.object({
    role: Joi.string().valid("user", "professional", "admin").optional(),
    isActive: Joi.string().valid("true", "false").optional(),
    page: Joi.number().integer().min(1).default(1),
    pageSize: Joi.number().integer().min(1).max(100).default(20),
    search: Joi.string().max(100).optional(),
  }),
};

export const userIdParamSchema = {
  params: Joi.object({
    id: Joi.string().required(),
  }),
};

export default {
  updateProfileSchema,
  updateNotificationSettingsSchema,
  updateFcmTokenSchema,
  getUsersSchema,
  userIdParamSchema,
};
