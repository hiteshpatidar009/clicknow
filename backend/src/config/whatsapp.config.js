import env from "./env.loader.js";

class WhatsAppConfig {
  constructor() {
    this.apiUrl = env.WHATSAPP_API_URL;
    this.phoneNumberId = env.WHATSAPP_PHONE_NUMBER_ID;
    this.accessToken = env.WHATSAPP_ACCESS_TOKEN;

    this.templates = {
      bookingConfirmation: "booking_confirmation",
      bookingReminder: "booking_reminder",
      bookingCancellation: "booking_cancellation",
      newBookingRequest: "new_booking_request",
      reviewRequest: "review_request",
      profileApproval: "profile_approval",
      profileRejection: "profile_rejection",
      marketing: "marketing_promotion",
    };
  }

  getApiUrl() {
    return `${this.apiUrl}/${this.phoneNumberId}/messages`;
  }

  getHeaders() {
    return {
      Authorization: `Bearer ${this.accessToken}`,
      "Content-Type": "application/json",
    };
  }

  getTemplate(templateName) {
    return this.templates[templateName] || templateName;
  }

  isConfigured() {
    return !!(this.phoneNumberId && this.accessToken);
  }
}

export default WhatsAppConfig;
