import Joi from "joi";

export const registerSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(100).required(),
    fullName: Joi.string().min(2).max(100).required(),
    phone: Joi.string()
      .pattern(/^\+?[1-9]\d{1,14}$/)
      .optional(),
    // ❌ role is NOT accepted at registration.
    // Everyone registers as 'client'. Role upgrades happen via onboarding.
  }),
};

export const loginSchema = {
  body: Joi.object({
    email: Joi.string()
      .trim()
      .lowercase()
      .email({ tlds: { allow: false } })
      .required(),
    password: Joi.string().trim().min(1).required(),
  }),
};

export const firebaseLoginSchema = {
  body: Joi.object({
    firebaseToken: Joi.string().required(),
  }),
};

export const refreshTokenSchema = {
  body: Joi.object({
    refreshToken: Joi.string().required(),
  }),
};

export const changePasswordSchema = {
  body: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(8).max(100).required(),
  }),
};

export const sendOtpSchema = {
  body: Joi.object({
    email: Joi.string().email().optional(),
    phone: Joi.string()
      .pattern(/^\+?[1-9]\d{1,14}$/) // E.164 format
      .optional(),
    recaptchaToken: Joi.string().optional(),
    provider: Joi.string().valid("mock", "firebase", "smtp").optional(),
    purpose: Joi.string().valid("registration", "login", "reset").optional(),
    role: Joi.string().valid("client", "professional").default("client"),
  }).or("email", "phone"),
};

export const verifyOtpSchema = {
  body: Joi.object({
    email: Joi.string().email().optional(),
    phone: Joi.string()
      .pattern(/^\+?[1-9]\d{1,14}$/)
      .optional(),
    otp: Joi.string().length(6).required(),
    provider: Joi.string().valid("mock", "firebase", "smtp").optional(),
    purpose: Joi.string().valid("registration", "login", "reset").optional(),
    role: Joi.string().valid("client", "professional").default("client"),
  }).or("email", "phone"),
};

export default {
  registerSchema,
  loginSchema,
  firebaseLoginSchema,
  refreshTokenSchema,
  changePasswordSchema,
};
