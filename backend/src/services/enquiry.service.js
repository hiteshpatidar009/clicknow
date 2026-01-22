/**
 * Enquiry Service
 */

import {
  enquiryRepository,
  professionalRepository,
  userRepository,
} from "../repositories/index.js";
import { EnquiryModel } from "../models/index.js";
import notificationService from "./notification.service.js";
import Logger from "../utils/logger.util.js";
import { ENQUIRY_STATUS } from "../utils/constants.util.js";

class EnquiryService {
  async createEnquiry(clientId, enquiryData) {
    const { professionalId, eventType, eventDate, location, budget, message } =
      enquiryData;

    const professional = await professionalRepository.findById(professionalId);
    if (!professional) throw new Error("Professional not found");

    const enquiryModel = new EnquiryModel({
      clientId,
      professionalId,
      eventType,
      eventDate,
      location,
      budget,
      message,
      status: ENQUIRY_STATUS.PENDING,
      adminApproved: false,
      profileAccessGranted: false,
    });

    const enquiry = await enquiryRepository.create(enquiryModel.toJSON());

    await notificationService.sendNotification(professional.userId, {
      type: "enquiry",
      title: "New Enquiry",
      body: `New ${eventType} enquiry`,
      data: { enquiryId: enquiry.id, action: "new_enquiry" },
      channels: ["push", "whatsapp"],
    });

    Logger.logBusinessEvent("enquiry_created", {
      enquiryId: enquiry.id,
      clientId,
      professionalId,
    });

    return enquiry;
  }

  async getById(enquiryId) {
    return enquiryRepository.findById(enquiryId);
  }

  async getClientEnquiries(clientId, options = {}) {
    return enquiryRepository.findByClientId(clientId, options);
  }

  async getProfessionalEnquiries(professionalId, options = {}) {
    return enquiryRepository.findByProfessionalId(professionalId, options);
  }

  async getPendingEnquiries(professionalId, options = {}) {
    return enquiryRepository.findPendingByProfessional(professionalId, options);
  }

  async respondToEnquiry(enquiryId, userId, note) {
    const enquiry = await enquiryRepository.findById(enquiryId);
    if (!enquiry) throw new Error("Enquiry not found");

    const updated = await enquiryRepository.update(enquiryId, {
      status: ENQUIRY_STATUS.RESPONDED,
      professionalNote: note,
      respondedAt: new Date(),
    });

    await notificationService.sendNotification(enquiry.clientId, {
      type: "enquiry_response",
      title: "Enquiry Response",
      body: "Professional responded to your enquiry",
      data: { enquiryId, action: "enquiry_response" },
      channels: ["push"],
    });

    return updated;
  }

  async closeEnquiry(enquiryId, note) {
    return enquiryRepository.update(enquiryId, {
      status: ENQUIRY_STATUS.CLOSED,
      closedNote: note,
      closedAt: new Date(),
    });
  }

  async convertToBooking(enquiryId, bookingId) {
    return enquiryRepository.update(enquiryId, {
      status: ENQUIRY_STATUS.CONVERTED,
      bookingId,
      convertedAt: new Date(),
    });
  }

  async getStatistics() {
    return enquiryRepository.getStatistics();
  }
}

export default new EnquiryService();
