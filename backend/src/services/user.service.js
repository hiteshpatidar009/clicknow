import { userRepository } from "../repositories/index.js";
import { UserModel } from "../models/index.js";
import Logger from "../utils/logger.util.js";
import { UserNotFoundError } from "../utils/errors.util.js";
import { cleanObject } from "../utils/helpers.util.js";

class UserService {
  /**
   * Get user by ID
   */
  async getUserById(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError();
    }
    return this.sanitizeUser(user);
  }

  /**
   * Get user profile
   */
  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError();
    }
    return this.sanitizeUser(user);
  }

  /**
   * Update user profile
   */
  async updateProfile(userId, updateData) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError();
    }

    const allowedFields = [
      "firstName",
      "lastName",
      "displayName",
      "avatar",
      "phone",
      "settings",
    ];

    const filteredData = {};
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    }

    if (filteredData.firstName || filteredData.lastName) {
      const firstName = filteredData.firstName || user.firstName;
      const lastName = filteredData.lastName || user.lastName;
      filteredData.displayName = `${firstName} ${lastName}`.trim();
    }

    const userModel = new UserModel({ ...user, ...filteredData });
    filteredData.searchTerms = userModel.generateSearchTerms();

    const updatedUser = await userRepository.update(userId, filteredData);

    Logger.logBusinessEvent("profile_update", { userId });

    return this.sanitizeUser(updatedUser);
  }

  /**
   * Update notification settings
   */
  async updateNotificationSettings(userId, settings) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError();
    }

    const updatedSettings = {
      ...user.settings,
      notifications: {
        ...user.settings?.notifications,
        ...settings,
      },
    };

    const updatedUser = await userRepository.update(userId, {
      settings: updatedSettings,
    });

    return this.sanitizeUser(updatedUser);
  }

  /**
   * Update FCM token
   */
  async updateFcmToken(userId, fcmToken) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError();
    }

    await userRepository.updateFcmToken(userId, fcmToken);
    return true;
  }

  /**
   * Get users (admin)
   */
  async getUsers(options = {}) {
    const { role, isActive, page, pageSize, search } = options;

    const queryOptions = {
      page: page || 1,
      pageSize: pageSize || 20,
      where: [],
    };

    if (role) {
      queryOptions.where.push({ field: "role", operator: "==", value: role });
    }

    if (isActive !== undefined) {
      queryOptions.where.push({
        field: "isActive",
        operator: "==",
        value: isActive,
      });
    }

    let result;
    if (search) {
      result = await userRepository.searchByName(search, queryOptions);
    } else {
      result = await userRepository.findActiveUsers(queryOptions);
    }

    return {
      data: result.data.map((user) => this.sanitizeUser(user)),
      pagination: result.pagination,
    };
  }

  /**
   * Activate user (admin)
   */
  async activateUser(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError();
    }

    const updatedUser = await userRepository.reactivateUser(userId);
    Logger.logBusinessEvent("user_activated", { userId, adminAction: true });

    return this.sanitizeUser(updatedUser);
  }

  /**
   * Deactivate user (admin)
   */
  async deactivateUser(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError();
    }

    const updatedUser = await userRepository.deactivateUser(userId);
    Logger.logBusinessEvent("user_deactivated", { userId, adminAction: true });

    return this.sanitizeUser(updatedUser);
  }

  /**
   * Delete user (soft delete)
   */
  async deleteUser(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError();
    }

    await userRepository.softDelete(userId);
    Logger.logBusinessEvent("user_deleted", { userId });

    return true;
  }

  /**
   * Get user statistics (admin)
   */
  async getStatistics() {
    return userRepository.getStatistics();
  }

  /**
   * Sanitize user data
   */
  sanitizeUser(user) {
    const { password, fcmToken, searchTerms, ...sanitized } = user;
    return sanitized;
  }
}

export default UserService;
