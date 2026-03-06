import Joi from "joi";

export const createChatSchema = {
  body: Joi.object({
    recipientId: Joi.string().required(),
    bookingId: Joi.string().optional(),
  }),
};

export const sendMessageSchema = {
  body: Joi.object({
    text: Joi.string().max(2000).when("attachments", {
      is: Joi.exist(),
      then: Joi.optional(),
      otherwise: Joi.required(),
    }),
    type: Joi.string().valid("text", "image", "file").default("text"),
    attachments: Joi.array()
      .items(
        Joi.object({
          url: Joi.string().uri().required(),
          type: Joi.string().valid("image", "document", "audio").required(),
          name: Joi.string().max(200).optional(),
          size: Joi.number().optional(),
        }),
      )
      .max(5)
      .optional(),
  }),
};

export const getMessagesSchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    pageSize: Joi.number().integer().min(1).max(100).default(50),
    before: Joi.date().iso().optional(),
  }),
};

export const getChatsSchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    pageSize: Joi.number().integer().min(1).max(50).default(20),
  }),
};

export const chatIdParamSchema = {
  params: Joi.object({
    id: Joi.string().required(),
  }),
};

export const messageIdParamSchema = {
  params: Joi.object({
    chatId: Joi.string().required(),
    messageId: Joi.string().required(),
  }),
};

export default {
  createChatSchema,
  sendMessageSchema,
  getMessagesSchema,
  getChatsSchema,
  chatIdParamSchema,
  messageIdParamSchema,
};
