import Joi from "joi";

const timeSlotSchema = Joi.object({
  start: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .required(),
  end: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .required(),
});

const dayScheduleSchema = Joi.object({
  isAvailable: Joi.boolean().required(),
  slots: Joi.array()
    .items(timeSlotSchema)
    .when("isAvailable", {
      is: true,
      then: Joi.array().min(1).required(),
      otherwise: Joi.array().optional(),
    }),
});

export const updateWeeklyScheduleSchema = {
  body: Joi.object({
    monday: dayScheduleSchema.optional(),
    tuesday: dayScheduleSchema.optional(),
    wednesday: dayScheduleSchema.optional(),
    thursday: dayScheduleSchema.optional(),
    friday: dayScheduleSchema.optional(),
    saturday: dayScheduleSchema.optional(),
    sunday: dayScheduleSchema.optional(),
  }).min(1),
};

export const blockedDateSchema = {
  body: Joi.object({
    date: Joi.date().iso().min("now").required(),
    reason: Joi.string().max(200).optional(),
  }),
};

export const specialDateSchema = {
  body: Joi.object({
    date: Joi.date().iso().min("now").required(),
    slots: Joi.array().items(timeSlotSchema).min(1).required(),
    reason: Joi.string().max(200).optional(),
  }),
};

export const bufferTimeSchema = {
  body: Joi.object({
    bufferTime: Joi.number().integer().min(0).max(120).required(),
  }),
};

export const bookingSettingsSchema = {
  body: Joi.object({
    minBookingNotice: Joi.number().integer().min(0).max(168).optional(),
    advanceBookingDays: Joi.number().integer().min(1).max(365).optional(),
    autoConfirm: Joi.boolean().optional(),
  }),
};

export const availableSlotsSchema = {
  query: Joi.object({
    date: Joi.date().iso().required(),
    duration: Joi.number().integer().min(30).max(480).default(60),
  }),
};

export const monthlyCalendarSchema = {
  query: Joi.object({
    year: Joi.number().integer().min(2020).max(2030).required(),
    month: Joi.number().integer().min(1).max(12).required(),
  }),
};

export const checkSlotSchema = {
  query: Joi.object({
    date: Joi.date().iso().required(),
    startTime: Joi.string()
      .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
      .required(),
    endTime: Joi.string()
      .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
      .required(),
  }),
};

export const dateParamSchema = {
  params: Joi.object({
    date: Joi.date().iso().required(),
  }),
};

export default {
  updateWeeklyScheduleSchema,
  blockedDateSchema,
  specialDateSchema,
  bufferTimeSchema,
  bookingSettingsSchema,
  availableSlotsSchema,
  monthlyCalendarSchema,
  checkSlotSchema,
  dateParamSchema,
};
