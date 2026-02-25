import Joi from "joi";

/**
 * BOOKING FLOW:
 *
 * OPTION A — Direct Booking (customer picks a professional):
 *   POST /bookings  { professionalId: "xxx", ... }
 *   → status: PENDING (professional confirms/rejects)
 *
 * OPTION B — Open Booking (admin assigns professional):
 *   POST /bookings  { professionalId: omitted/null, ... }
 *   → status: PENDING (admin will assign a professional)
 *   → admin calls PUT /admin/bookings/:id/assign { professionalId: "xxx" }
 *   → status: PROCESSING (professional then confirms/rejects)
 */

// All event types supported by the platform
const EVENT_TYPES = [
  "wedding",
  "pre_wedding",
  "birthday",
  "anniversary",
  "baby_shower",
  "naming_ceremony",
  "corporate",
  "product",
  "portrait",
  "graduation",
  "engagement",
  "concert",
  "event",
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
  description: Joi.string().max(1000).optional(),
  guestCount: Joi.number().integer().min(1).optional(),
  venueName: Joi.string().max(200).optional(),
  venueType: Joi.string().valid("indoor", "outdoor", "both").optional(),
  serviceType: Joi.string().max(200).optional(),
  shootType: Joi.string().optional(),
  // ✅ FIX: specialRequirements accepts both a plain string OR an array of strings
  specialRequirements: Joi.alternatives()
    .try(
      Joi.string().max(1000),
      Joi.array().items(Joi.string().max(500)),
    )
    .optional(),
  additionalInfo: Joi.string().max(1000).optional(),
}).unknown(true);

const pricingSchema = Joi.object({
  type: Joi.string().valid("hourly", "package").optional(),
  packageName: Joi.string().optional(),
  baseAmount: Joi.number().min(0).optional(),
  totalAmount: Joi.number().min(0).optional(),
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
    // ✅ FIX: professionalId is truly optional — allow missing, null, OR empty string
    professionalId: Joi.string().allow("", null).optional(),

    bookingDate: Joi.date().iso().min("now").required(),
    startTime: Joi.string().optional(),
    endTime: Joi.string().optional(),
    // ✅ FIX: support duration if endTime is missing
    duration: Joi.alternatives().try(Joi.number(), Joi.string()).optional(),

    // ✅ FIX: eventType can be dynamic from the new service forms
    eventType: Joi.string().required(),

    eventDetails: eventDetailsSchema.optional(),
    location: locationSchema.required(),
    pricing: pricingSchema.optional(),
    clientNotes: Joi.string().max(1000).optional(),
    notes: Joi.string().max(1000).optional(), // alias for clientNotes
  }),
};

export const rescheduleSchema = {
  body: Joi.object({
    bookingDate: Joi.date().iso().min("now").required(),
    startTime: Joi.string().optional(),
    endTime: Joi.string().optional(),
    duration: Joi.alternatives().try(Joi.number(), Joi.string()).optional(),
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

export const assignProfessionalSchema = {
  body: Joi.object({
    professionalId: Joi.string().required(),
    notes: Joi.string().max(500).optional(),
  }),
};

export const getBookingsSchema = {
  query: Joi.object({
    // All valid statuses — maps to frontend tabs:
    // no status = All, pending = Awaiting, processing = Admin Assigned,
    // confirmed = Confirmed, completed = Past, cancelled = Cancelled
    status: Joi.string()
      .valid(
        "pending",      // just created, awaiting assignment or professional response
        "open",         // open call
        "assigned",     // professional assigned (alias)
        "processing",   // admin assigned, awaiting professional confirm
        "confirmed",    // professional confirmed
        "completed",    // job done
        "cancelled",    // cancelled by client or admin
        "rejected",     // rejected by professional
        "rescheduled",  // rescheduled
      )
      .optional(),
    page: Joi.number().integer().min(1).default(1),
    pageSize: Joi.number().integer().min(1).max(50).default(20),
  }),
};

export const calendarSchema = {
  query: Joi.object({
    year: Joi.number().integer().min(2020).max(2035).required(),
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
  assignProfessionalSchema,
  getBookingsSchema,
  calendarSchema,
  bookingIdParamSchema,
  dateParamSchema,
};
