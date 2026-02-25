import {
  bookingRepository,
  professionalRepository,
  availabilityRepository,
  userRepository,
} from "../repositories/index.js";
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
   *
   * professionalId is OPTIONAL:
   *  - If provided → direct booking (professional confirms/rejects)
   *  - If omitted  → admin assigns a professional later via PUT /bookings/:id/assign
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
      notes,
    } = bookingData;

    let parsedDuration = Number(bookingData.duration) || (typeof bookingData.duration === 'string' ? parseFloat(bookingData.duration) : 0);
    let computedEndTime = endTime;

    if (startTime && !endTime && parsedDuration > 0) {
      const [h, m] = startTime.split(":").map(Number);
      const totalMins = h * 60 + m + parsedDuration;
      const endH = Math.floor(totalMins / 60) % 24;
      const endM = totalMins % 60;
      computedEndTime = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
    } else if (startTime && endTime) {
      parsedDuration = this.calculateDuration(startTime, endTime);
    }

    // Only validate professional if one was specified
    let professional = null;
    if (professionalId) {
      professional = await professionalRepository.findById(professionalId);
      if (!professional) {
        throw new ProfessionalNotFoundError();
      }

      if (professional.status !== PROFESSIONAL_STATUS.APPROVED) {
        throw new ProfessionalNotApprovedError();
      }

      const hasConflict = await bookingRepository.hasTimeSlotConflict(
        professionalId,
        new Date(bookingDate),
        startTime,
        computedEndTime || endTime,
      );

      if (hasConflict) {
        throw new BookingSlotUnavailableError();
      }
    }

    // Build booking data directly — BookingModel is a plain Mongoose model
    // with no static factory methods.
    const bookingData_ = {
      clientId,
      professionalId: professionalId || null,
      bookingDate: new Date(bookingDate),
      startTime,
      endTime: computedEndTime || endTime,
      duration: parsedDuration,
      eventType,
      eventDetails: eventDetails || {},
      location: location || {},
      pricing: pricing || {},
      clientNotes: clientNotes || notes || "",
      status: BOOKING_STATUS.PENDING,
      isDeleted: false,
    };

    const booking = await bookingRepository.create(bookingData_);

    // Notify professional if directly assigned
    if (professional) {
      const user = await userRepository.findById(professional.userId);
      if (user) {
        await notificationService.sendNewBookingNotification(user.id, {
          bookingId: booking.id,
          eventType,
          bookingDate,
        });
      }
    }

    Logger.logBusinessEvent("booking_created", {
      bookingId: booking.id,
      clientId,
      professionalId: professionalId || null,
      hasDirectProfessional: !!professionalId,
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

    await professionalRepository.incrementBookingCount(booking.professionalId);

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

    // Cancellable if not already completed/cancelled/rejected
    const nonCancellableStatuses = [
      BOOKING_STATUS.COMPLETED,
      BOOKING_STATUS.CANCELLED,
      BOOKING_STATUS.REJECTED,
    ];
    if (nonCancellableStatuses.includes(booking.status)) {
      throw new BookingCannotCancelError();
    }

    const updated = await bookingRepository.updateStatus(
      bookingId,
      BOOKING_STATUS.CANCELLED,
      reason,
    );

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

    // Reschedulable if pending or confirmed only
    const reschedulableStatuses = [
      BOOKING_STATUS.PENDING,
      BOOKING_STATUS.CONFIRMED,
      BOOKING_STATUS.PROCESSING,
    ];
    if (!reschedulableStatuses.includes(booking.status)) {
      throw new BookingCannotRescheduleError();
    }

    const { bookingDate, startTime, endTime, duration } = newSchedule;

    let parsedDuration = Number(duration) || (typeof duration === 'string' ? parseFloat(duration) : 0);
    let computedEndTime = endTime;

    if (startTime && !endTime && parsedDuration > 0) {
      const [h, m] = startTime.split(":").map(Number);
      const totalMins = h * 60 + m + parsedDuration;
      const endH = Math.floor(totalMins / 60) % 24;
      const endM = totalMins % 60;
      computedEndTime = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
    } else if (startTime && endTime) {
      parsedDuration = this.calculateDuration(startTime, endTime);
    }

    const hasConflict = await bookingRepository.hasTimeSlotConflict(
      booking.professionalId,
      new Date(bookingDate),
      startTime,
      computedEndTime || endTime,
      bookingId,
    );

    if (hasConflict) {
      throw new BookingSlotUnavailableError();
    }

    const updated = await bookingRepository.update(bookingId, {
      bookingDate: new Date(bookingDate),
      startTime,
      endTime: computedEndTime || endTime,
      duration: parsedDuration,
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
   * Get all bookings (admin)
   */
  async getAllBookings(options = {}) {
    const where = [{ field: "isDeleted", operator: "==", value: false }];

    if (options.status) {
      where.push({ field: "status", operator: "==", value: options.status });
    }

    if (options.professionalId) {
      where.push({ field: "professionalId", operator: "==", value: options.professionalId });
    }

    if (options.clientId) {
      where.push({ field: "clientId", operator: "==", value: options.clientId });
    }

    // Fetch all bookings first to avoid composite index issues
    const allBookings = await bookingRepository.findAll({ where });

    // Filter by date and payment status in memory
    let filtered = allBookings;

    if (options.startDate && options.endDate) {
        const start = new Date(options.startDate);
        const end = new Date(options.endDate);
        filtered = filtered.filter(b => {
            const d = b.bookingDate && b.bookingDate.toDate ? b.bookingDate.toDate() : new Date(b.bookingDate);
            return d >= start && d <= end;
        });
    }

    if (options.paymentStatus && options.paymentStatus !== 'All Payments') {
        const status = options.paymentStatus.toLowerCase();
        // Map 'Pending' -> 'pending', etc.
        filtered = filtered.filter(b => b.pricing?.paymentStatus === status);
    }

    // Sort in memory
    filtered.sort((a, b) => {
        const dateA = a.createdAt && a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const dateB = b.createdAt && b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return dateB - dateA;
    });

    // Pagination
    const page = parseInt(options.page) || 1;
    const pageSize = parseInt(options.pageSize) || 20;
    const totalCount = filtered.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const startIdx = (page - 1) * pageSize;
    const paginatedData = filtered.slice(startIdx, startIdx + pageSize);

    // Enrich with names
    const enrichedData = await Promise.all(paginatedData.map(async (booking) => {
        let clientName = "Unknown";
        let professionalName = "Unknown";

        if (booking.clientId) {
            const client = await userRepository.findById(booking.clientId);
            if (client) clientName = `${client.firstName} ${client.lastName}`.trim();
        }

        if (booking.professionalId) {
            const prof = await professionalRepository.findById(booking.professionalId);
            if (prof) professionalName = prof.businessName || "Unknown";
        }

        return {
            ...booking,
            clientName,
            professionalName
        };
    }));

    return {
        data: enrichedData,
        pagination: {
            page,
            pageSize,
            totalCount,
            totalPages,
            hasMore: startIdx + pageSize < totalCount,
            nextCursor: null
        }
    };
  }

  /**
   * Get booking statistics
   */
  async getStatistics(filters = {}) {
    return bookingRepository.getStatistics(filters);
  }

  /**
   * Get revenue stats over time
   */
  async getRevenueStats(startDate, endDate, groupBy = 'day') {
    return bookingRepository.getRevenueOverTime(new Date(startDate), new Date(endDate), groupBy);
  }

  /**
   * Process booking reminders
   */
  async processReminders() {
    const bookings = await bookingRepository.findBookingsNeedingReminder(24);

    for (const booking of bookings) {
      try {
        await notificationService.sendBookingReminderNotification(
          booking.clientId,
          {
            bookingId: booking.id,
            eventType: booking.eventType,
            bookingDate: booking.bookingDate,
          },
        );

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
  /**
   * Assign a professional to a booking (Admin)
   */
  async assignProfessional(bookingId, professionalId, adminId) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) {
      throw new BookingNotFoundError();
    }
    
    const professional = await professionalRepository.findById(professionalId);
    if (!professional) {
        throw new ProfessionalNotFoundError();
    }

    if (professional.status !== PROFESSIONAL_STATUS.APPROVED) {
        throw new ProfessionalNotApprovedError();
    }

    // Update booking
    const updated = await bookingRepository.update(bookingId, {
      professionalId,
      status: BOOKING_STATUS.PROCESSING,
      assignedAt: new Date(),
      updatedAt: new Date(),
      statusReason: 'Assigned by Admin'
    });

    // Notify Professional
    const proUser = await userRepository.findById(professional.userId);
    if (proUser) {
      await notificationService.sendNotification(proUser.id, {
        type: "booking_assigned",
        title: "New Booking Assigned",
        body: `You have been assigned a new booking (ID: ${bookingId}) by admin.`,
        data: { bookingId, action: "view_booking" },
        channels: ["push", "email"],
      });
    }

    // Notify Client
    if (booking.clientId) {
      await notificationService.sendNotification(booking.clientId, {
        type: "booking_update",
        title: "Professional Assigned",
        body: `A professional (${professional.businessName}) has been assigned to your booking. Status is now Processing.`,
        data: { bookingId, action: "view_booking" },
        channels: ["push", "email"],
      });
    }
    
    Logger.logBusinessEvent("booking_assigned", {
      bookingId,
      professionalId,
      adminId
    });

    return updated;
  }
}

export default new BookingService();
