/**
 * Availability Repository
 * Data access layer for professional availability schedules
 */

import BaseRepository from "./base.repository.js";
import { COLLECTIONS } from "../utils/constants.util.js";

class AvailabilityRepository extends BaseRepository {
  constructor() {
    super(COLLECTIONS.AVAILABILITY);
  }

  /**
   * Find availability by professional ID
   * @param {string} professionalId - Professional ID
   * @returns {Promise<Object|null>} Availability document
   */
  async findByProfessionalId(professionalId) {
    return this.findByField("professionalId", professionalId);
  }

  /**
   * Get or create availability for professional
   * @param {string} professionalId - Professional ID
   * @returns {Promise<Object>} Availability document
   */
  async getOrCreate(professionalId) {
    let availability = await this.findByProfessionalId(professionalId);

    if (!availability) {
      availability = await this.create({
        professionalId,
        weeklySchedule: this.getDefaultWeeklySchedule(),
        blockedDates: [],
        specialDates: [],
        bufferTime: 30, // Default 30 minutes buffer
        advanceBookingDays: 60, // Default 60 days advance booking
        minBookingNotice: 24, // Default 24 hours notice
        timezone: "UTC",
      });
    }

    return availability;
  }

  /**
   * Get default weekly schedule
   * @returns {Object} Default schedule
   */
  getDefaultWeeklySchedule() {
    const defaultDay = {
      isAvailable: true,
      slots: [
        { start: "09:00", end: "12:00" },
        { start: "14:00", end: "18:00" },
      ],
    };

    const weekendDay = {
      isAvailable: false,
      slots: [],
    };

    return {
      monday: { ...defaultDay },
      tuesday: { ...defaultDay },
      wednesday: { ...defaultDay },
      thursday: { ...defaultDay },
      friday: { ...defaultDay },
      saturday: { ...weekendDay },
      sunday: { ...weekendDay },
    };
  }

  /**
   * Update weekly schedule
   * @param {string} professionalId - Professional ID
   * @param {Object} weeklySchedule - New weekly schedule
   * @returns {Promise<Object>} Updated availability
   */
  async updateWeeklySchedule(professionalId, weeklySchedule) {
    const availability = await this.findByProfessionalId(professionalId);

    if (!availability) {
      throw new Error("Availability not found");
    }

    return this.update(availability.id, { weeklySchedule });
  }

  /**
   * Add blocked date
   * @param {string} professionalId - Professional ID
   * @param {Object} blockedDate - Blocked date info
   * @returns {Promise<Object>} Updated availability
   */
  async addBlockedDate(professionalId, blockedDate) {
    const availability = await this.findByProfessionalId(professionalId);

    if (!availability) {
      throw new Error("Availability not found");
    }

    return this.addToArray(availability.id, "blockedDates", {
      ...blockedDate,
      addedAt: new Date().toISOString(),
    });
  }

  /**
   * Remove blocked date
   * @param {string} professionalId - Professional ID
   * @param {string} date - Date to unblock (ISO string)
   * @returns {Promise<Object>} Updated availability
   */
  async removeBlockedDate(professionalId, date) {
    const availability = await this.findByProfessionalId(professionalId);

    if (!availability) {
      throw new Error("Availability not found");
    }

    const blockedDates = availability.blockedDates.filter(
      (bd) => bd.date !== date,
    );

    return this.update(availability.id, { blockedDates });
  }

  /**
   * Add special date (custom hours)
   * @param {string} professionalId - Professional ID
   * @param {Object} specialDate - Special date info
   * @returns {Promise<Object>} Updated availability
   */
  async addSpecialDate(professionalId, specialDate) {
    const availability = await this.findByProfessionalId(professionalId);

    if (!availability) {
      throw new Error("Availability not found");
    }

    // Remove existing special date for same date if exists
    const specialDates = availability.specialDates.filter(
      (sd) => sd.date !== specialDate.date,
    );

    specialDates.push({
      ...specialDate,
      addedAt: new Date().toISOString(),
    });

    return this.update(availability.id, { specialDates });
  }

  /**
   * Remove special date
   * @param {string} professionalId - Professional ID
   * @param {string} date - Date to remove (ISO string)
   * @returns {Promise<Object>} Updated availability
   */
  async removeSpecialDate(professionalId, date) {
    const availability = await this.findByProfessionalId(professionalId);

    if (!availability) {
      throw new Error("Availability not found");
    }

    const specialDates = availability.specialDates.filter(
      (sd) => sd.date !== date,
    );

    return this.update(availability.id, { specialDates });
  }

  /**
   * Update buffer time
   * @param {string} professionalId - Professional ID
   * @param {number} bufferTime - Buffer time in minutes
   * @returns {Promise<Object>} Updated availability
   */
  async updateBufferTime(professionalId, bufferTime) {
    const availability = await this.findByProfessionalId(professionalId);

    if (!availability) {
      throw new Error("Availability not found");
    }

    return this.update(availability.id, { bufferTime });
  }

  /**
   * Update booking settings
   * @param {string} professionalId - Professional ID
   * @param {Object} settings - Booking settings
   * @returns {Promise<Object>} Updated availability
   */
  async updateBookingSettings(professionalId, settings) {
    const availability = await this.findByProfessionalId(professionalId);

    if (!availability) {
      throw new Error("Availability not found");
    }

    const updateData = {};

    if (settings.advanceBookingDays !== undefined) {
      updateData.advanceBookingDays = settings.advanceBookingDays;
    }

    if (settings.minBookingNotice !== undefined) {
      updateData.minBookingNotice = settings.minBookingNotice;
    }

    if (settings.timezone !== undefined) {
      updateData.timezone = settings.timezone;
    }

    return this.update(availability.id, updateData);
  }

  /**
   * Get available slots for a date
   * @param {string} professionalId - Professional ID
   * @param {Date} date - Date to check
   * @returns {Promise<Array>} Available time slots
   */
  async getAvailableSlotsForDate(professionalId, date) {
    const availability = await this.findByProfessionalId(professionalId);

    if (!availability) {
      return [];
    }

    const dateStr = date.toISOString().split("T")[0];

    // Check if date is blocked
    const isBlocked = availability.blockedDates.some(
      (bd) => bd.date === dateStr,
    );

    if (isBlocked) {
      return [];
    }

    // Check for special date
    const specialDate = availability.specialDates.find(
      (sd) => sd.date === dateStr,
    );

    if (specialDate) {
      return specialDate.slots || [];
    }

    // Get day of week
    const dayNames = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const dayName = dayNames[date.getDay()];

    const daySchedule = availability.weeklySchedule[dayName];

    if (!daySchedule || !daySchedule.isAvailable) {
      return [];
    }

    return daySchedule.slots || [];
  }

  /**
   * Check if date is available
   * @param {string} professionalId - Professional ID
   * @param {Date} date - Date to check
   * @returns {Promise<boolean>} Is available
   */
  async isDateAvailable(professionalId, date) {
    const slots = await this.getAvailableSlotsForDate(professionalId, date);
    return slots.length > 0;
  }
}

export default new AvailabilityRepository();
