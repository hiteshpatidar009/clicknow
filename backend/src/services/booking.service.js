/**
 * Booking Service
 * Business logic for booking operations
 */

import {
  bookingRepository,
  professionalRepository,
  availabilityRepository,
  userRepository,
} from "../repositories/index.js";
import { BookingModel } from "../models/index.js";
import notificationService from "./notification.service.js";
import Logger from "../utils/logger.util.js";
import {
  BOOKING_STATUS,
  PROFESSIONAL_STATUS,
} from "../utils/constants.util.js";
import {
  BookingNotFoundError,
  BookingSlotUnavailableError,
  BookingCannotCancelError,
  BookingCannotRescheduleError,
  ProfessionalNotFoundError,
  ProfessionalNotApprovedError,
} from "../utils/errors.util.js";

class BookingService {
  /**
   * Create a new booking
   */
  async createBooking(clientId, bookingData) {
    const {
      professionalId,
      bookingDate,
      startTime,
      endTime,
      eventType,
      eventDetails,
      location,
      pricing,
      clientNotes,
    } = bookingData;

    // Validate professional
    const professional = await professionalRepository.findById(professionalId);
    if (!professional) {
      throw new ProfessionalNotFoundError();
    }

    if (professional.status !== PROFESSIONAL_STATUS.APPROVED) {
      throw new ProfessionalNotApprovedError();
    }

    // Check availability
    const hasConflict = await bookingRepository.hasTimeSlotConflict(
      professionalId,
      new Date(bookingDate),
      startTime,
      endTime,
    );

    if (hasConflict) {
      throw new BookingSlotUnavailableError();
    }

    // Calculate duration
    const duration = this.calculateDuration(startTime, endTime);

    // Create booking model
    const bookingModel = BookingModel.forNewBooking({
      clientId,
      professionalId,
      bookingDate: new Date(bookingDate),
      startTime,
      endTime,
      duration,
      eventType,
      eventDetails,
      location,
      pricing,
      clientNotes,
    });

    const booking = await bookingRepository.create(bookingModel.toJSON());

    // Send notification to professional
    const user = await userRepository.findById(professional.userId);
    if (user) {
      await notificationService.sendNewBookingNotification(user.id, {
        bookingId: booking.id,
        eventType,
        bookingDate,
      });
    }

    Logger.logBusinessEvent("booking_created", {
      bookingId: booking.id,
      clientId,
      professionalId,
    });

    return booking;
  }

  /**
   * Get booking by ID
   */
  async getById(bookingId) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) {
      throw new BookingNotFoundError();
    }
    return booking;
  }

  /**
   * Get client bookings
   */
  async getClientBookings(clientId, options = {}) {
    const result = await bookingRepository.findByClientId(clientId, {
      page: options.page || 1,
      pageSize: options.pageSize || 20,
      where:
        options.status ?
          [{ field: "status", operator: "==", value: options.status }]
        : [],
    });

    return result;
  }

  /**
   * Get professional bookings
   */
  async getProfessionalBookings(professionalId, options = {}) {
    const result = await bookingRepository.findByProfessionalId(
      professionalId,
      {
        page: options.page || 1,
        pageSize: options.pageSize || 20,
        where:
          options.status ?
            [{ field: "status", operator: "==", value: options.status }]
          : [],
      },
    );

    return result;
  }

  /**
   * Get upcoming bookings for professional
   */
  async getUpcomingBookings(professionalId, options = {}) {
    return bookingRepository.findUpcoming(professionalId, options);
  }

  /**
   * Confirm booking (by professional)
   */
  async confirmBooking(bookingId, professionalUserId) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) {
      throw new BookingNotFoundError();
    }

    if (booking.status !== BOOKING_STATUS.PENDING) {
      throw new Error("Booking is not pending");
    }

    const updated = await bookingRepository.updateStatus(
      bookingId,
      BOOKING_STATUS.CONFIRMED,
    );

    // Increment booking count
    await professionalRepository.incrementBookingCount(booking.professionalId);

    // Notify client
    await notificationService.sendBookingConfirmationNotification(
      booking.clientId,
      {
        bookingId,
        eventType: booking.eventType,
        bookingDate: booking.bookingDate,
      },
    );

    Logger.logBusinessEvent("booking_confirmed", {
      bookingId,
      professionalUserId,
    });

    return updated;
  }

  /**
   * Reject booking (by professional)
   */
  async rejectBooking(bookingId, professionalUserId, reason) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) {
      throw new BookingNotFoundError();
    }

    if (booking.status !== BOOKING_STATUS.PENDING) {
      throw new Error("Booking is not pending");
    }

    const updated = await bookingRepository.updateStatus(
      bookingId,
      BOOKING_STATUS.REJECTED,
      reason,
    );

    // Notify client
    await notificationService.sendBookingRejectionNotification(
      booking.clientId,
      {
        bookingId,
        reason,
      },
    );

    Logger.logBusinessEvent("booking_rejected", {
      bookingId,
      professionalUserId,
      reason,
    });

    return updated;
  }

  /**
   * Cancel booking
   */
  async cancelBooking(bookingId, userId, reason) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) {
      throw new BookingNotFoundError();
    }

    const bookingModel = BookingModel.fromDocument(booking);
    if (!bookingModel.canBeCancelled()) {
      throw new BookingCannotCancelError();
    }

    const updated = await bookingRepository.updateStatus(
      bookingId,
      BOOKING_STATUS.CANCELLED,
      reason,
    );

    // Notify the other party
    const notifyUserId =
      booking.clientId === userId ?
        (await professionalRepository.findById(booking.professionalId))?.userId
      : booking.clientId;

    if (notifyUserId) {
      await notificationService.sendBookingCancellationNotification(
        notifyUserId,
        {
          bookingId,
          reason,
        },
      );
    }

    Logger.logBusinessEvent("booking_cancelled", { bookingId, userId, reason });

    return updated;
  }

  /**
   * Reschedule booking
   */
  async rescheduleBooking(bookingId, userId, newSchedule) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) {
      throw new BookingNotFoundError();
    }

    const bookingModel = BookingModel.fromDocument(booking);
    if (!bookingModel.canBeRescheduled()) {
      throw new BookingCannotRescheduleError();
    }

    const { bookingDate, startTime, endTime } = newSchedule;

    // Check availability for new slot
    const hasConflict = await bookingRepository.hasTimeSlotConflict(
      booking.professionalId,
      new Date(bookingDate),
      startTime,
      endTime,
      bookingId,
    );

    if (hasConflict) {
      throw new BookingSlotUnavailableError();
    }

    const duration = this.calculateDuration(startTime, endTime);

    const updated = await bookingRepository.update(bookingId, {
      bookingDate: new Date(bookingDate),
      startTime,
      endTime,
      duration,
      status: BOOKING_STATUS.RESCHEDULED,
      rescheduledAt: new Date(),
    });

    Logger.logBusinessEvent("booking_rescheduled", { bookingId, userId });

    return updated;
  }

  /**
   * Complete booking
   */
  async completeBooking(bookingId) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) {
      throw new BookingNotFoundError();
    }

    if (booking.status !== BOOKING_STATUS.CONFIRMED) {
      throw new Error("Only confirmed bookings can be completed");
    }

    const updated = await bookingRepository.updateStatus(
      bookingId,
      BOOKING_STATUS.COMPLETED,
    );

    // Notify client to leave review
    await notificationService.sendReviewRequestNotification(booking.clientId, {
      bookingId,
      professionalId: booking.professionalId,
    });

    Logger.logBusinessEvent("booking_completed", { bookingId });

    return updated;
  }

  /**
   * Get bookings for a date
   */
  async getBookingsForDate(professionalId, date) {
    return bookingRepository.findByDate(professionalId, new Date(date));
  }

  /**
   * Get bookings in date range
   */
  async getBookingsInRange(professionalId, startDate, endDate) {
    return bookingRepository.findByDateRange(
      professionalId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  /**
   * Get booking statistics
   */
  async getStatistics(filters = {}) {
    return bookingRepository.getStatistics(filters);
  }

  /**
   * Process booking reminders
   */
  async processReminders() {
    const bookings = await bookingRepository.findBookingsNeedingReminder(24);

    for (const booking of bookings) {
      try {
        // Notify client
        await notificationService.sendBookingReminderNotification(
          booking.clientId,
          {
            bookingId: booking.id,
            eventType: booking.eventType,
            bookingDate: booking.bookingDate,
          },
        );

        // Notify professional
        const professional = await professionalRepository.findById(
          booking.professionalId,
        );
        if (professional) {
          await notificationService.sendBookingReminderNotification(
            professional.userId,
            {
              bookingId: booking.id,
              eventType: booking.eventType,
              bookingDate: booking.bookingDate,
            },
          );
        }

        await bookingRepository.markReminderSent(booking.id);
      } catch (error) {
        Logger.error("Failed to send reminder", error, {
          bookingId: booking.id,
        });
      }
    }

    return bookings.length;
  }

  /**
   * Calculate duration in minutes
   */
  calculateDuration(startTime, endTime) {
    const [startHours, startMins] = startTime.split(":").map(Number);
    const [endHours, endMins] = endTime.split(":").map(Number);

    const startTotal = startHours * 60 + startMins;
    const endTotal = endHours * 60 + endMins;

    return endTotal - startTotal;
  }
}

export default new BookingService();
