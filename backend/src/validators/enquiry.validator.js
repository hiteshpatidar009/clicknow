import Joi from "joi";

const EVENT_TYPES = [
  "wedding",
  "birthday",
  "corporate",
  "portrait",
  "event",
  "product",
  "other",
];

const locationSchema = Joi.object({
  city: Joi.string().max(100).required(),
  state: Joi.string().max(100).optional(),
  area: Joi.string().max(200).optional(),
});

const budgetSchema = Joi.object({
  min: Joi.number().min(0).optional(),
  max: Joi.number().min(0).optional(),
  currency: Joi.string().valid("INR", "USD").default("INR"),
});

export const createEnquirySchema = {
  body: Joi.object({
    professionalId: Joi.string().required(),
    eventType: Joi.string().required(),
    eventDate: Joi.date().iso().min("now").optional(),
    eventDetails: Joi.object({
      description: Joi.string().max(2000).optional(),
      guestCount: Joi.number().integer().min(1).optional(),
      duration: Joi.number().min(1).optional(),
    }).unknown(true).optional(),
    location: locationSchema.required(),
    budget: budgetSchema.optional(),
    requirements: Joi.string().max(2000).optional(),
    contactPreference: Joi.string()
      .valid("call", "whatsapp", "email", "chat")
      .default("chat"),
  }),
};

export const respondSchema = {
  body: Joi.object({
    note: Joi.string().max(1000).optional(),
  }),
};

export const convertToBookingSchema = {
  body: Joi.object({
    bookingId: Joi.string().required(),
  }),
};

export const closeEnquirySchema = {
  body: Joi.object({
    note: Joi.string().max(500).optional(),
  }),
};

export const getEnquiriesSchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    pageSize: Joi.number().integer().min(1).max(50).default(20),
  }).unknown(true),
};

export const enquiryIdParamSchema = {
  params: Joi.object({
    id: Joi.string().required(),
  }),
};

export default {
  createEnquirySchema,
  respondSchema,
  convertToBookingSchema,
  closeEnquirySchema,
  getEnquiriesSchema,
  enquiryIdParamSchema,
};
