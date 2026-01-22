import Joi from "joi";

export const deleteFileSchema = {
  body: Joi.object({
    key: Joi.string().required(),
  }),
};

export const getUploadUrlSchema = {
  body: Joi.object({
    fileName: Joi.string().required(),
    contentType: Joi.string().required(),
    folder: Joi.string()
      .valid("avatars", "portfolio", "chat-attachments", "general")
      .optional(),
  }),
};

export const getSignedUrlSchema = {
  query: Joi.object({
    key: Joi.string().required(),
    expiresIn: Joi.number().integer().min(60).max(86400).optional(),
  }),
};

export default {
  deleteFileSchema,
  getUploadUrlSchema,
  getSignedUrlSchema,
};
