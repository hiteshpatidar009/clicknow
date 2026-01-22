import jwt from "jsonwebtoken";
import { appConfig } from "../config/index.js";
import { userRepository } from "../repositories/index.js";
import ApiResponse from "../utils/response.util.js";
import { AuthenticationError } from "../utils/errors.util.js";
import Logger from "../utils/logger.util.js";

class AuthMiddleware {
  /**
   * Verify JWT token
   */
  authenticate = async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return ApiResponse.unauthorized(res, "Access token required");
      }

      const token = authHeader.split(" ")[1];

      try {
        const decoded = jwt.verify(token, appConfig.jwt.secret);

        req.user = {
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role,
        };

        next();
      } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
          return ApiResponse.unauthorized(
            res,
            "Token expired",
            "AUTH_TOKEN_EXPIRED",
          );
        }
        return ApiResponse.unauthorized(
          res,
          "Invalid token",
          "AUTH_INVALID_TOKEN",
        );
      }
    } catch (error) {
      Logger.error("Authentication middleware error", error);
      return ApiResponse.serverError(res, "Authentication failed");
    }
  };

  /**
   * Optional authentication - doesn't fail if no token
   */
  optionalAuth = async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        req.user = null;
        return next();
      }

      const token = authHeader.split(" ")[1];

      try {
        const decoded = jwt.verify(token, appConfig.jwt.secret);
        req.user = {
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role,
        };
      } catch (error) {
        req.user = null;
      }

      next();
    } catch (error) {
      req.user = null;
      next();
    }
  };

  /**
   * Role-based authorization
   */
  authorize = (...roles) => {
    return (req, res, next) => {
      if (!req.user) {
        return ApiResponse.unauthorized(res, "Authentication required");
      }

      if (!roles.includes(req.user.role)) {
        Logger.logAuth("authorization_failed", req.user.userId, false, {
          requiredRoles: roles,
          userRole: req.user.role,
        });
        return ApiResponse.forbidden(res, "Insufficient permissions");
      }

      next();
    };
  };

  /**
   * Verified user check
   */
  verifiedOnly = async (req, res, next) => {
    try {
      const user = await userRepository.findById(req.user.userId);

      if (!user) {
        return ApiResponse.unauthorized(res, "User not found");
      }

      if (!user.isVerified) {
        return ApiResponse.forbidden(res, "Email verification required");
      }

      next();
    } catch (error) {
      Logger.error("Verified only middleware error", error);
      return ApiResponse.serverError(res);
    }
  };

  /**
   * Active user check
   */
  activeOnly = async (req, res, next) => {
    try {
      const user = await userRepository.findById(req.user.userId);

      if (!user) {
        return ApiResponse.unauthorized(res, "User not found");
      }

      if (!user.isActive) {
        return ApiResponse.forbidden(res, "Account is deactivated");
      }

      next();
    } catch (error) {
      Logger.error("Active only middleware error", error);
      return ApiResponse.serverError(res);
    }
  };

  get adminOnly() {
    return this.authorize("admin");
  }

  get professionalOnly() {
    return this.authorize("professional", "admin");
  }
}

export default new AuthMiddleware();
