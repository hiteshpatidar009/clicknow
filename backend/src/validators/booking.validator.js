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
  address: Joi.string().max(500).required(),
  city: Joi.string().max(100).required(),
  state: Joi.string().max(100).optional(),
  pincode: Joi.string()
    .pattern(/^\d{6}$/)
    .optional(),
  landmark: Joi.string().max(200).optional(),
  coordinates: Joi.object({
    latitude: Joi.number().min(-90).max(90),
    longitude: Joi.number().min(-180).max(180),
  }).optional(),
});

const eventDetailsSchema = Joi.object({
  guestCount: Joi.number().integer().min(1).optional(),
  venueName: Joi.string().max(200).optional(),
  venueType: Joi.string().valid("indoor", "outdoor", "both").optional(),
  specialRequirements: Joi.array().items(Joi.string()).optional(),
  additionalInfo: Joi.string().max(1000).optional(),
});

const pricingSchema = Joi.object({
  baseAmount: Joi.number().min(0).required(),
  additionalCharges: Joi.array()
    .items(
      Joi.object({
        description: Joi.string().required(),
        amount: Joi.number().min(0).required(),
      }),
    )
    .optional(),
  discount: Joi.number().min(0).optional(),
  currency: Joi.string().valid("INR", "USD").default("INR"),
});

export const createBookingSchema = {
  body: Joi.object({
    professionalId: Joi.string().required(),
    bookingDate: Joi.date().iso().min("now").required(),
    startTime: Joi.string()
      .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
      .required(),
    endTime: Joi.string()
      .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
      .required(),
    eventType: Joi.string()
      .valid(...EVENT_TYPES)
      .required(),
    eventDetails: eventDetailsSchema.optional(),
    location: locationSchema.required(),
    pricing: pricingSchema.required(),
    clientNotes: Joi.string().max(1000).optional(),
  }),
};

export const rescheduleSchema = {
  body: Joi.object({
    bookingDate: Joi.date().iso().min("now").required(),
    startTime: Joi.string()
      .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
      .required(),
    endTime: Joi.string()
      .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
      .required(),
  }),
};

export const cancelSchema = {
  body: Joi.object({
    reason: Joi.string().max(500).optional(),
  }),
};

export const rejectSchema = {
  body: Joi.object({
    reason: Joi.string().max(500).required(),
  }),
};

export const getBookingsSchema = {
  query: Joi.object({
    status: Joi.string()
      .valid(
        "pending",
        "confirmed",
        "completed",
        "cancelled",
        "rejected",
        "rescheduled",
      )
      .optional(),
    page: Joi.number().integer().min(1).default(1),
    pageSize: Joi.number().integer().min(1).max(50).default(20),
  }),
};

export const calendarSchema = {
  query: Joi.object({
    year: Joi.number().integer().min(2020).max(2030).required(),
    month: Joi.number().integer().min(1).max(12).required(),
  }),
};

export const bookingIdParamSchema = {
  params: Joi.object({
    id: Joi.string().required(),
  }),
};

export const dateParamSchema = {
  params: Joi.object({
    date: Joi.date().iso().required(),
  }),
};

export default {
  createBookingSchema,
  rescheduleSchema,
  cancelSchema,
  rejectSchema,
  getBookingsSchema,
  calendarSchema,
  bookingIdParamSchema,
  dateParamSchema,
};
