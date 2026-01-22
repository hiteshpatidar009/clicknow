import { ENQUIRY_STATUS } from "../utils/constants.util.js";

class EnquiryModel {
  constructor(data = {}) {
    this.id = data.id || null;
    this.clientId = data.clientId || null;
    this.professionalId = data.professionalId || null;
    this.eventType = data.eventType || "";
    this.eventDate = data.eventDate || null;
    this.eventDetails = data.eventDetails || "";
    this.location = data.location || {};
    this.budget = data.budget || null;
    this.requirements = data.requirements || "";
    this.contactPreference = data.contactPreference || "in_app";
    this.status = data.status || ENQUIRY_STATUS.PENDING;
    this.statusNote = data.statusNote || null;
    this.statusUpdatedAt = data.statusUpdatedAt || null;
    this.bookingId = data.bookingId || null;
    this.isDeleted = data.isDeleted || false;
    this.respondedAt = data.respondedAt || null;
    this.convertedAt = data.convertedAt || null;
    this.closedAt = data.closedAt || null;
    this.createdAt = data.createdAt || null;
    this.updatedAt = data.updatedAt || null;
  }

  /**
   * Check if enquiry is pending
   */
  isPending() {
    return this.status === ENQUIRY_STATUS.PENDING;
  }

  /**
   * Check if enquiry has been responded to
   */
  isResponded() {
    return this.status === ENQUIRY_STATUS.RESPONDED;
  }

  /**
   * Check if enquiry was converted to booking
   */
  isConverted() {
    return this.status === ENQUIRY_STATUS.CONVERTED;
  }

  /**
   * Check if enquiry is closed
   */
  isClosed() {
    return this.status === ENQUIRY_STATUS.CLOSED;
  }

  /**
   * Check if enquiry can be responded to
   */
  canBeResponded() {
    return this.isPending();
  }

  /**
   * Check if enquiry can be converted to booking
   */
  canBeConverted() {
    return [ENQUIRY_STATUS.PENDING, ENQUIRY_STATUS.RESPONDED].includes(
      this.status,
    );
  }

  /**
   * Convert to plain object for database storage
   */
  toJSON() {
    return {
      id: this.id,
      clientId: this.clientId,
      professionalId: this.professionalId,
      eventType: this.eventType,
      eventDate: this.eventDate,
      eventDetails: this.eventDetails,
      location: this.location,
      budget: this.budget,
      requirements: this.requirements,
      contactPreference: this.contactPreference,
      status: this.status,
      statusNote: this.statusNote,
      statusUpdatedAt: this.statusUpdatedAt,
      bookingId: this.bookingId,
      isDeleted: this.isDeleted,
      respondedAt: this.respondedAt,
      convertedAt: this.convertedAt,
      closedAt: this.closedAt,
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
      eventType: this.eventType,
      eventDate: this.eventDate,
      status: this.status,
      bookingId: this.bookingId,
      createdAt: this.createdAt,
    };
  }

  /**
   * Convert to professional view
   */
  toProfessionalView() {
    return {
      id: this.id,
      clientId: this.clientId,
      eventType: this.eventType,
      eventDate: this.eventDate,
      eventDetails: this.eventDetails,
      location: this.location,
      budget: this.budget,
      requirements: this.requirements,
      contactPreference: this.contactPreference,
      status: this.status,
      createdAt: this.createdAt,
    };
  }

  /**
   * Create EnquiryModel from database document
   */
  static fromDocument(doc) {
    return new EnquiryModel(doc);
  }

  /**
   * Create EnquiryModel for new enquiry
   */
  static forNewEnquiry(data) {
    return new EnquiryModel({
      ...data,
      status: ENQUIRY_STATUS.PENDING,
      isDeleted: false,
    });
  }
}

export default EnquiryModel;
