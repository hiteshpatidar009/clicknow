import ApiResponse from "../utils/response.util.js";

function formatJoiErrors(error, source) {
  return error.details.map((detail) => ({
    field: detail.path.join("."),
    message: detail.message.replace(/"/g, ""),
    source,
  }));
}

class ValidationMiddleware {
  applyValidatedValue = (req, key, value) => {
    if (key === "query") {
      const target = req.query;
      Object.keys(target).forEach((k) => {
        delete target[k];
      });
      Object.assign(target, value);
      return;
    }
    req[key] = value;
  };

  validate = (schema) => {
    return (req, res, next) => {
      const errors = [];

      if (schema.body) {
        const { error, value } = schema.body.validate(req.body, {
          abortEarly: false,
          stripUnknown: true,
        });

        if (error) {
          errors.push(...formatJoiErrors(error, "body"));
        } else {
          this.applyValidatedValue(req, "body", value);
        }
      }

      if (schema.query) {
        const { error, value } = schema.query.validate(req.query, {
          abortEarly: false,
          stripUnknown: true,
        });

        if (error) {
          errors.push(...formatJoiErrors(error, "query"));
        } else {
          this.applyValidatedValue(req, "query", value);
        }
      }

      if (schema.params) {
        const { error, value } = schema.params.validate(req.params, {
          abortEarly: false,
          stripUnknown: true,
        });

        if (error) {
          errors.push(...formatJoiErrors(error, "params"));
        } else {
          this.applyValidatedValue(req, "params", value);
        }
      }

      if (errors.length > 0) {
        return ApiResponse.validationError(res, errors, "Validation failed");
      }

      next();
    };
  };

  validateBody = (schema) => this.validate({ body: schema });

  validateQuery = (schema) => this.validate({ query: schema });

  validateParams = (schema) => this.validate({ params: schema });
}

export default new ValidationMiddleware();
export const { validate, validateBody, validateQuery, validateParams } = new ValidationMiddleware();
