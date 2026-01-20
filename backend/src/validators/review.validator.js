/**
 * Review Validators
 * Joi schemas for review endpoints
 */

import Joi from "joi";

export const createReviewSchema = {
  body: Joi.object({
    bookingId: Joi.string().required(),
    rating: Joi.number().min(1).max(5).required(),
    title: Joi.string().min(5).max(100).optional(),
    content: Joi.string().min(20).max(2000).required(),
  }),
};

export const addResponseSchema = {
  body: Joi.object({
    response: Joi.string().min(10).max(1000).required(),
  }),
};

export const reportReviewSchema = {
  body: Joi.object({
    reason: Joi.string()
      .valid("inappropriate", "spam", "fake", "offensive", "other")
      .required(),
  }),
};

export const rejectReviewSchema = {
  body: Joi.object({
    reason: Joi.string().max(500).required(),
  }),
};

export const getReviewsSchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    pageSize: Joi.number().integer().min(1).max(50).default(20),
  }),
};

export const reviewIdParamSchema = {
  params: Joi.object({
    id: Joi.string().required(),
  }),
};

export default {
  createReviewSchema,
  addResponseSchema,
  reportReviewSchema,
  rejectReviewSchema,
  getReviewsSchema,
  reviewIdParamSchema,
};
