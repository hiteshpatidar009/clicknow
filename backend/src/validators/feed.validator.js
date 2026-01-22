import Joi from "joi";

export const createPostSchema = {
  body: Joi.object({
    caption: Joi.string().max(2000).required(),
    media: Joi.array()
      .items(
        Joi.object({
          type: Joi.string().valid("image", "video").required(),
          url: Joi.string().uri().required(),
          thumbnail: Joi.string().uri(),
        })
      )
      .min(1)
      .max(10)
      .required(),
    category: Joi.string().required(),
    tags: Joi.array().items(Joi.string()).max(30),
    location: Joi.object({
      city: Joi.string(),
      coordinates: Joi.object({
        lat: Joi.number().min(-90).max(90),
        lng: Joi.number().min(-180).max(180),
      }),
    }),
  }),
};

export const getFeedSchema = {
  query: Joi.object({
    feedType: Joi.string().valid("all", "following").default("all"),
    page: Joi.number().integer().min(1).default(1),
    pageSize: Joi.number().integer().min(1).max(100).default(20),
  }),
};

export const addCommentSchema = {
  body: Joi.object({
    text: Joi.string().min(1).max(500).required(),
  }),
};

export const getCommentsSchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    pageSize: Joi.number().integer().min(1).max(100).default(20),
  }),
};
