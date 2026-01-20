/**
 * Validation Middleware
 * Request validation using Joi schemas
 */

import ApiResponse from "../utils/response.util.js";

/**
 * Validate request against schema
 * @param {Object} schema - Joi schema with body, query, params
 */
export const validate = (schema) => {
  return (req, res, next) => {
    const errors = [];

    // Validate body
    if (schema.body) {
      const { error, value } = schema.body.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        errors.push(...formatJoiErrors(error, "body"));
      } else {
        req.body = value;
      }
    }

    // Validate query
    if (schema.query) {
      const { error, value } = schema.query.validate(req.query, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        errors.push(...formatJoiErrors(error, "query"));
      } else {
        req.query = value;
      }
    }

    // Validate params
    if (schema.params) {
      const { error, value } = schema.params.validate(req.params, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        errors.push(...formatJoiErrors(error, "params"));
      } else {
        req.params = value;
      }
    }

    if (errors.length > 0) {
      return ApiResponse.validationError(res, errors, "Validation failed");
    }

    next();
  };
};

/**
 * Format Joi errors for response
 */
function formatJoiErrors(error, source) {
  return error.details.map((detail) => ({
    field: detail.path.join("."),
    message: detail.message.replace(/"/g, ""),
    source,
  }));
}

/**
 * Validate body only (shorthand)
 */
export const validateBody = (schema) => validate({ body: schema });

/**
 * Validate query only (shorthand)
 */
export const validateQuery = (schema) => validate({ query: schema });

/**
 * Validate params only (shorthand)
 */
export const validateParams = (schema) => validate({ params: schema });

export default {
  validate,
  validateBody,
  validateQuery,
  validateParams,
};
