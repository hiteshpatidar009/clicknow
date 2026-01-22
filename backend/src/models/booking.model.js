import { BOOKING_STATUS } from "../utils/constants.util.js";

class BookingModel {
  constructor(data = {}) {
    this.id = data.id || null;
    this.clientId = data.clientId || null;
    this.professionalId = data.professionalId || null;
    this.enquiryId = data.enquiryId || null;
    this.bookingDate = data.bookingDate || null;
    this.startTime = data.startTime || null;
    this.endTime = data.endTime || null;
    this.duration = data.duration || 0;
    this.eventType = data.eventType || "";
    this.eventDetails = data.eventDetails || {};
    this.location = data.location || this.getDefaultLocation();
    this.pricing = data.pricing || this.getDefaultPricing();
    this.status = data.status || BOOKING_STATUS.PENDING;
    this.statusReason = data.statusReason || null;
    this.statusUpdatedAt = data.statusUpdatedAt || null;
    this.notes = data.notes || "";
    this.clientNotes = data.clientNotes || "";
    this.professionalNotes = data.professionalNotes || "";
    this.hasReview = data.hasReview || false;
    this.reviewId = data.reviewId || null;
    this.reminderSent = data.reminderSent || false;
    this.reminderSentAt = data.reminderSentAt || null;
    this.isDeleted = data.isDeleted || false;
    this.confirmedAt = data.confirmedAt || null;
    this.cancelledAt = data.cancelledAt || null;
    this.completedAt = data.completedAt || null;
    this.rejectedAt = data.rejectedAt || null;
    this.createdAt = data.createdAt || null;
    this.updatedAt = data.updatedAt || null;
  }

  /**
   * Get default location structure
   */
  getDefaultLocation() {
    return {
      type: "client",
      address: "",
      city: "",
      state: "",
      pincode: "",
      coordinates: {
        latitude: null,
        longitude: null,
      },
      instructions: "",
    };
  }

  /**
   * Get default pricing structure
   */
  getDefaultPricing() {
    return {
      type: "hourly",
      packageId: null,
      packageName: "",
      baseAmount: 0,
      hours: 0,
      additionalCharges: [],
      discounts: [],
      travelFee: 0,
      totalAmount: 0,
      currency: "INR",
      isPaid: false,
      paymentStatus: "pending",
      paidAmount: 0,
    };
  }

  /**
   * Calculate duration in hours
   */
  getDurationInHours() {
    return this.duration / 60;
  }

  /**
   * Calculate total amount
   */
  calculateTotal() {
    let total = this.pricing.baseAmount;

    if (this.pricing.additionalCharges) {
      for (const charge of this.pricing.additionalCharges) {
        total += charge.amount;
      }
    }

    if (this.pricing.discounts) {
      for (const discount of this.pricing.discounts) {
        if (discount.type === "percentage") {
          total -= (total * discount.value) / 100;
        } else {
          total -= discount.value;
        }
      }
    }

    total += this.pricing.travelFee || 0;

    this.pricing.totalAmount = Math.max(0, total);
    return this.pricing.totalAmount;
  }

  /**
   * Check if booking is pending
   */
  isPending() {
    return this.status === BOOKING_STATUS.PENDING;
  }

  /**
   * Check if booking is confirmed
   */
  isConfirmed() {
    return this.status === BOOKING_STATUS.CONFIRMED;
  }

  /**
   * Check if booking is completed
   */
  isCompleted() {
    return this.status === BOOKING_STATUS.COMPLETED;
  }

  /**
   * Check if booking is cancelled
   */
  isCancelled() {
    return this.status === BOOKING_STATUS.CANCELLED;
  }

  /**
   * Check if booking is in the past
   */
  isPast() {
    if (!this.bookingDate) return false;
    const bookingDateTime = new Date(this.bookingDate);
    return bookingDateTime < new Date();
  }

  /**
   * Check if booking is upcoming
   */
  isUpcoming() {
    if (!this.bookingDate) return false;
    const bookingDateTime = new Date(this.bookingDate);
    return bookingDateTime >= new Date() && this.isConfirmed();
  }

  /**
   * Check if booking can be cancelled
   */
  canBeCancelled() {
    return [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED].includes(
      this.status,
    );
  }

  /**
   * Check if booking can be reviewed
   */
  canBeReviewed() {
    return this.isCompleted() && !this.hasReview;
  }

  /**
   * Check if booking can be rescheduled
   */
  canBeRescheduled() {
    return this.isConfirmed() && !this.isPast();
  }

  /**
   * Convert to plain object for database storage
   */
  toJSON() {
    return {
      id: this.id,
      clientId: this.clientId,
      professionalId: this.professionalId,
      enquiryId: this.enquiryId,
      bookingDate: this.bookingDate,
      startTime: this.startTime,
      endTime: this.endTime,
      duration: this.duration,
      eventType: this.eventType,
      eventDetails: this.eventDetails,
      location: this.location,
      pricing: this.pricing,
      status: this.status,
      statusReason: this.statusReason,
      statusUpdatedAt: this.statusUpdatedAt,
      notes: this.notes,
      clientNotes: this.clientNotes,
      professionalNotes: this.professionalNotes,
      hasReview: this.hasReview,
      reviewId: this.reviewId,
      reminderSent: this.reminderSent,
      reminderSentAt: this.reminderSentAt,
      isDeleted: this.isDeleted,
      confirmedAt: this.confirmedAt,
      cancelledAt: this.cancelledAt,
      completedAt: this.completedAt,
      rejectedAt: this.rejectedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Convert to client view
   */
  toClientView() {
    return {
      id: this.id,
      professionalId: this.professionalId,
      bookingDate: this.bookingDate,
      startTime: this.startTime,
      endTime: this.endTime,
      duration: this.duration,
      eventType: this.eventType,
      location: this.location,
      pricing: {
        totalAmount: this.pricing.totalAmount,
        currency: this.pricing.currency,
        isPaid: this.pricing.isPaid,
        paymentStatus: this.pricing.paymentStatus,
      },
      status: this.status,
      hasReview: this.hasReview,
      canBeReviewed: this.canBeReviewed(),
      canBeCancelled: this.canBeCancelled(),
      canBeRescheduled: this.canBeRescheduled(),
    };
  }

  /**
   * Convert to professional view
   */
  toProfessionalView() {
    return {
      id: this.id,
      clientId: this.clientId,
      bookingDate: this.bookingDate,
      startTime: this.startTime,
      endTime: this.endTime,
      duration: this.duration,
      eventType: this.eventType,
      eventDetails: this.eventDetails,
      location: this.location,
      pricing: this.pricing,
      status: this.status,
      clientNotes: this.clientNotes,
      hasReview: this.hasReview,
    };
  }

  /**
   * Create BookingModel from database document
   */
  static fromDocument(doc) {
    return new BookingModel(doc);
  }

  /**
   * Create BookingModel for new booking
   */
  static forNewBooking(data) {
    const booking = new BookingModel({
      ...data,
      status: BOOKING_STATUS.PENDING,
      hasReview: false,
      reminderSent: false,
      isDeleted: false,
    });

    booking.calculateTotal();
    return booking;
  }
}

export default BookingModel;
