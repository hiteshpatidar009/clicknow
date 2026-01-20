/**
 * Enquiry Service
 * Business logic for client enquiries
 */

import {
  enquiryRepository,
  professionalRepository,
  userRepository,
} from "../repositories/index.js";
import { EnquiryModel } from "../models/index.js";
import notificationService from "./notification.service.js";
import Logger from "../utils/logger.util.js";
import {
  ENQUIRY_STATUS,
  PROFESSIONAL_STATUS,
} from "../utils/constants.util.js";
import {
  EnquiryNotFoundError,
  EnquiryAlreadyExistsError,
  ProfessionalNotFoundError,
  ProfessionalNotApprovedError,
} from "../utils/errors.util.js";

class EnquiryService {
  /**
   * Create enquiry
   */
  async createEnquiry(clientId, enquiryData) {
    const {
      professionalId,
      eventType,
      eventDate,
      eventDetails,
      location,
      budget,
      requirements,
      contactPreference,
    } = enquiryData;

    // Validate professional
    const professional = await professionalRepository.findById(professionalId);
    if (!professional) {
      throw new ProfessionalNotFoundError();
    }

    if (professional.status !== PROFESSIONAL_STATUS.APPROVED) {
      throw new ProfessionalNotApprovedError();
    }

    // Check for existing pending enquiry
    const hasPending = await enquiryRepository.hasPendingEnquiry(
      clientId,
      professionalId,
    );
    if (hasPending) {
      throw new EnquiryAlreadyExistsError();
    }

    // Create enquiry
    const enquiryModel = EnquiryModel.forNewEnquiry({
      clientId,
      professionalId,
      eventType,
      eventDate: eventDate ? new Date(eventDate) : null,
      eventDetails,
      location,
      budget,
      requirements,
      contactPreference,
    });

    const enquiry = await enquiryRepository.create(enquiryModel.toJSON());

    // Notify professional
    const user = await userRepository.findById(professional.userId);
    if (user) {
      await notificationService.sendNewEnquiryNotification(user.id, {
        enquiryId: enquiry.id,
        eventType,
      });
    }

    Logger.logBusinessEvent("enquiry_created", {
      enquiryId: enquiry.id,
      clientId,
      professionalId,
    });

    return enquiry;
  }

  /**
   * Get enquiry by ID
   */
  async getById(enquiryId) {
    const enquiry = await enquiryRepository.findById(enquiryId);
    if (!enquiry) {
      throw new EnquiryNotFoundError();
    }
    return enquiry;
  }

  /**
   * Get client enquiries
   */
  async getClientEnquiries(clientId, options = {}) {
    return enquiryRepository.findByClientId(clientId, {
      page: options.page || 1,
      pageSize: options.pageSize || 20,
    });
  }

  /**
   * Get professional enquiries
   */
  async getProfessionalEnquiries(professionalId, options = {}) {
    return enquiryRepository.findByProfessionalId(professionalId, {
      page: options.page || 1,
      pageSize: options.pageSize || 20,
    });
  }

  /**
   * Get pending enquiries for professional
   */
  async getPendingEnquiries(professionalId, options = {}) {
    return enquiryRepository.findPendingByProfessionalId(
      professionalId,
      options,
    );
  }

  /**
   * Respond to enquiry
   */
  async respondToEnquiry(enquiryId, professionalUserId, note) {
    const enquiry = await enquiryRepository.findById(enquiryId);
    if (!enquiry) {
      throw new EnquiryNotFoundError();
    }

    // Verify ownership
    const professional = await professionalRepository.findById(
      enquiry.professionalId,
    );
    if (!professional || professional.userId !== professionalUserId) {
      throw new Error("Unauthorized");
    }

    const updated = await enquiryRepository.updateStatus(
      enquiryId,
      ENQUIRY_STATUS.RESPONDED,
      note,
    );

    Logger.logBusinessEvent("enquiry_responded", { enquiryId });

    return updated;
  }

  /**
   * Convert enquiry to booking
   */
  async convertToBooking(enquiryId, bookingId) {
    const enquiry = await enquiryRepository.findById(enquiryId);
    if (!enquiry) {
      throw new EnquiryNotFoundError();
    }

    const updated = await enquiryRepository.convertToBooking(
      enquiryId,
      bookingId,
    );

    Logger.logBusinessEvent("enquiry_converted", { enquiryId, bookingId });

    return updated;
  }

  /**
   * Close enquiry
   */
  async closeEnquiry(enquiryId, note) {
    const enquiry = await enquiryRepository.findById(enquiryId);
    if (!enquiry) {
      throw new EnquiryNotFoundError();
    }

    const updated = await enquiryRepository.updateStatus(
      enquiryId,
      ENQUIRY_STATUS.CLOSED,
      note,
    );

    Logger.logBusinessEvent("enquiry_closed", { enquiryId });

    return updated;
  }

  /**
   * Get enquiry statistics
   */
  async getStatistics(filters = {}) {
    return enquiryRepository.getStatistics(filters);
  }
}

export default new EnquiryService();
