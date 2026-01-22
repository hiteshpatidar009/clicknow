import Joi from "joi";

export const followUserSchema = {
  body: Joi.object({
    userId: Joi.string().required(),
  }),
};

export const unfollowUserSchema = {
  body: Joi.object({
    userId: Joi.string().required(),
  }),
};

export const getFollowersSchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    pageSize: Joi.number().integer().min(1).max(100).default(20),
  }),
};

export const getFollowingSchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    pageSize: Joi.number().integer().min(1).max(100).default(20),
  }),
};
