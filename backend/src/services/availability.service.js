/**
 * Availability Service
 * Business logic for professional availability
 */

import {
  availabilityRepository,
  bookingRepository,
} from "../repositories/index.js";
import Logger from "../utils/logger.util.js";
import { BOOKING_STATUS } from "../utils/constants.util.js";
import {
  calculateDuration,
  addMinutesToTime,
  timeToMinutes,
  minutesToTime,
} from "../utils/helpers.util.js";

class AvailabilityService {
  /**
   * Get availability for professional
   */
  async getAvailability(professionalId) {
    return availabilityRepository.getOrCreate(professionalId);
  }

  /**
   * Update weekly schedule
   */
  async updateWeeklySchedule(professionalId, weeklySchedule) {
    const updated = await availabilityRepository.updateWeeklySchedule(
      professionalId,
      weeklySchedule,
    );
    Logger.logBusinessEvent("availability_updated", {
      professionalId,
      type: "weekly_schedule",
    });
    return updated;
  }

  /**
   * Add blocked date
   */
  async addBlockedDate(professionalId, blockedDate) {
    const { date, reason } = blockedDate;

    const updated = await availabilityRepository.addBlockedDate(
      professionalId,
      {
        date,
        reason,
        type: "full_day",
      },
    );

    Logger.logBusinessEvent("blocked_date_added", { professionalId, date });
    return updated;
  }

  /**
   * Remove blocked date
   */
  async removeBlockedDate(professionalId, date) {
    const updated = await availabilityRepository.removeBlockedDate(
      professionalId,
      date,
    );
    Logger.logBusinessEvent("blocked_date_removed", { professionalId, date });
    return updated;
  }

  /**
   * Add special date (custom hours)
   */
  async addSpecialDate(professionalId, specialDate) {
    const { date, slots, reason } = specialDate;

    const updated = await availabilityRepository.addSpecialDate(
      professionalId,
      {
        date,
        slots,
        reason,
      },
    );

    Logger.logBusinessEvent("special_date_added", { professionalId, date });
    return updated;
  }

  /**
   * Remove special date
   */
  async removeSpecialDate(professionalId, date) {
    const updated = await availabilityRepository.removeSpecialDate(
      professionalId,
      date,
    );
    Logger.logBusinessEvent("special_date_removed", { professionalId, date });
    return updated;
  }

  /**
   * Update buffer time
   */
  async updateBufferTime(professionalId, bufferTime) {
    const updated = await availabilityRepository.updateBufferTime(
      professionalId,
      bufferTime,
    );
    Logger.logBusinessEvent("buffer_time_updated", {
      professionalId,
      bufferTime,
    });
    return updated;
  }

  /**
   * Update booking settings
   */
  async updateBookingSettings(professionalId, settings) {
    const updated = await availabilityRepository.updateBookingSettings(
      professionalId,
      settings,
    );
    Logger.logBusinessEvent("booking_settings_updated", { professionalId });
    return updated;
  }

  /**
   * Get available slots for a date
   */
  async getAvailableSlots(professionalId, date, duration = 60) {
    const availability =
      await availabilityRepository.getOrCreate(professionalId);
    const dateObj = new Date(date);

    // Check advance booking limit
    const maxDate = new Date();
    maxDate.setDate(
      maxDate.getDate() + (availability.advanceBookingDays || 60),
    );

    if (dateObj > maxDate) {
      return {
        available: false,
        reason: "Date is too far in advance",
        slots: [],
      };
    }

    // Check minimum notice
    const minNoticeDate = new Date();
    minNoticeDate.setHours(
      minNoticeDate.getHours() + (availability.minBookingNotice || 24),
    );

    if (dateObj < minNoticeDate) {
      return {
        available: false,
        reason: "Insufficient notice time",
        slots: [],
      };
    }

    // Get base slots for the date
    const baseSlots = await availabilityRepository.getAvailableSlotsForDate(
      professionalId,
      dateObj,
    );

    if (baseSlots.length === 0) {
      return {
        available: false,
        reason: "No availability on this date",
        slots: [],
      };
    }

    // Get existing bookings for the date
    const existingBookings = await bookingRepository.findByDate(
      professionalId,
      dateObj,
    );
    const bookedSlots = existingBookings
      .filter((b) =>
        [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED].includes(b.status),
      )
      .map((b) => ({
        start: b.startTime,
        end: b.endTime,
      }));

    // Calculate available time slots
    const availableSlots = this.calculateAvailableSlots(
      baseSlots,
      bookedSlots,
      duration,
      availability.bufferTime || 30,
    );

    return {
      available: availableSlots.length > 0,
      slots: availableSlots,
      bufferTime: availability.bufferTime,
    };
  }

  /**
   * Get availability calendar for a month
   */
  async getMonthlyAvailability(professionalId, year, month) {
    const availability =
      await availabilityRepository.getOrCreate(professionalId);

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    // Get bookings for the month
    const bookings = await bookingRepository.findByDateRange(
      professionalId,
      startDate,
      endDate,
    );

    const calendar = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split("T")[0];
      const dayBookings = bookings.filter((b) => {
        const bookingDate = new Date(b.bookingDate).toISOString().split("T")[0];
        return bookingDate === dateStr;
      });

      // Check if date is blocked
      const isBlocked = availability.blockedDates?.some(
        (bd) => bd.date === dateStr,
      );

      // Get slots for the day
      const slots = await availabilityRepository.getAvailableSlotsForDate(
        professionalId,
        currentDate,
      );

      calendar.push({
        date: dateStr,
        isAvailable: !isBlocked && slots.length > 0,
        isBlocked,
        bookingsCount: dayBookings.length,
        slots: slots,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return calendar;
  }

  /**
   * Check if a specific time slot is available
   */
  async isSlotAvailable(professionalId, date, startTime, endTime) {
    const availability =
      await availabilityRepository.getOrCreate(professionalId);
    const dateObj = new Date(date);

    // Check if date is blocked
    const dateStr = dateObj.toISOString().split("T")[0];
    const isBlocked = availability.blockedDates?.some(
      (bd) => bd.date === dateStr,
    );

    if (isBlocked) {
      return false;
    }

    // Check if within working hours
    const baseSlots = await availabilityRepository.getAvailableSlotsForDate(
      professionalId,
      dateObj,
    );
    const isWithinWorkingHours = baseSlots.some((slot) => {
      return startTime >= slot.start && endTime <= slot.end;
    });

    if (!isWithinWorkingHours) {
      return false;
    }

    // Check for booking conflicts
    const hasConflict = await bookingRepository.hasTimeSlotConflict(
      professionalId,
      dateObj,
      startTime,
      endTime,
    );

    return !hasConflict;
  }

  /**
   * Calculate available time slots considering bookings and buffer
   */
  calculateAvailableSlots(baseSlots, bookedSlots, duration, bufferTime) {
    const availableSlots = [];

    for (const slot of baseSlots) {
      const slotStart = timeToMinutes(slot.start);
      const slotEnd = timeToMinutes(slot.end);

      // Generate possible slots within this time range
      let currentStart = slotStart;

      while (currentStart + duration <= slotEnd) {
        const currentEnd = currentStart + duration;
        const startTimeStr = minutesToTime(currentStart);
        const endTimeStr = minutesToTime(currentEnd);

        // Check if this slot conflicts with any booking
        const hasConflict = bookedSlots.some((booked) => {
          const bookedStart = timeToMinutes(booked.start) - bufferTime;
          const bookedEnd = timeToMinutes(booked.end) + bufferTime;

          return currentStart < bookedEnd && currentEnd > bookedStart;
        });

        if (!hasConflict) {
          availableSlots.push({
            startTime: startTimeStr,
            endTime: endTimeStr,
            duration,
          });
        }

        // Move to next slot (30 minute intervals)
        currentStart += 30;
      }
    }

    return availableSlots;
  }
}

export default new AvailabilityService();
