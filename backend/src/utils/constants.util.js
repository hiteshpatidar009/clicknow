/**
 * Constants Utility
 * Central location for all application constants
 */

// Firestore Collection Names
export const COLLECTIONS = {
  USERS: "users",
  PROFESSIONALS: "professionals",
  BOOKINGS: "bookings",
  REVIEWS: "reviews",
  AVAILABILITY: "availability",
  CHATS: "chats",
  MESSAGES: "messages",
  NOTIFICATIONS: "notifications",
  ENQUIRIES: "enquiries",
  CATEGORIES: "categories",
  SETTINGS: "settings",
  ANALYTICS: "analytics",
};

// User Roles
export const USER_ROLES = {
  CLIENT: "client",
  PROFESSIONAL: "professional",
  ADMIN: "admin",
};

// Professional Categories
export const PROFESSIONAL_CATEGORIES = {
  PHOTOGRAPHER: "photographer",
  MUSICIAN: "musician",
  GUITARIST: "guitarist",
  MAGICIAN: "magician",
  DJ: "dj",
  VIDEOGRAPHER: "videographer",
  MAKEUP_ARTIST: "makeup_artist",
  DECORATOR: "decorator",
  OTHER: "other",
};

// Professional Status
export const PROFESSIONAL_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  SUSPENDED: "suspended",
};

// Booking Status
export const BOOKING_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
  REJECTED: "rejected",
  RESCHEDULED: "rescheduled",
  NO_SHOW: "no_show",
};

// Review Status
export const REVIEW_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  REMOVED: "removed",
};

// Enquiry Status
export const ENQUIRY_STATUS = {
  PENDING: "pending",
  RESPONDED: "responded",
  CONVERTED: "converted",
  CLOSED: "closed",
};

// Notification Types
export const NOTIFICATION_TYPES = {
  BOOKING: "booking",
  REVIEW: "review",
  CHAT: "chat",
  ENQUIRY: "enquiry",
  MARKETING: "marketing",
  SYSTEM: "system",
  REMINDER: "reminder",
  PROFILE: "profile",
};

// Event Types / Specialties
export const EVENT_TYPES = {
  WEDDING: "wedding",
  PORTRAIT: "portrait",
  CORPORATE: "corporate",
  BIRTHDAY: "birthday",
  ENGAGEMENT: "engagement",
  MATERNITY: "maternity",
  NEWBORN: "newborn",
  FAMILY: "family",
  PRODUCT: "product",
  FASHION: "fashion",
  REAL_ESTATE: "real_estate",
  FOOD: "food",
  CONCERT: "concert",
  PARTY: "party",
  OTHER: "other",
};

// File Types
export const FILE_TYPES = {
  IMAGE: "image",
  VIDEO: "video",
  DOCUMENT: "document",
};

// Allowed MIME Types
export const ALLOWED_MIME_TYPES = {
  IMAGES: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  VIDEOS: ["video/mp4", "video/quicktime", "video/x-msvideo", "video/webm"],
  DOCUMENTS: ["application/pdf"],
};

// Pricing Types
export const PRICING_TYPES = {
  HOURLY: "hourly",
  PACKAGE: "package",
  CUSTOM: "custom",
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: "pending",
  PARTIAL: "partial",
  COMPLETED: "completed",
  REFUNDED: "refunded",
  FAILED: "failed",
};

// Sort Options
export const SORT_OPTIONS = {
  RATING_DESC: "rating_desc",
  RATING_ASC: "rating_asc",
  PRICE_DESC: "price_desc",
  PRICE_ASC: "price_asc",
  DISTANCE: "distance",
  NEWEST: "newest",
  POPULAR: "popular",
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

// Error Codes
export const ERROR_CODES = {
  // Auth Errors
  AUTH_INVALID_TOKEN: "AUTH_INVALID_TOKEN",
  AUTH_TOKEN_EXPIRED: "AUTH_TOKEN_EXPIRED",
  AUTH_UNAUTHORIZED: "AUTH_UNAUTHORIZED",
  AUTH_FORBIDDEN: "AUTH_FORBIDDEN",

  // User Errors
  USER_NOT_FOUND: "USER_NOT_FOUND",
  USER_ALREADY_EXISTS: "USER_ALREADY_EXISTS",
  USER_INACTIVE: "USER_INACTIVE",
  USER_INVALID_CREDENTIALS: "USER_INVALID_CREDENTIALS",

  // Professional Errors
  PROFESSIONAL_NOT_FOUND: "PROFESSIONAL_NOT_FOUND",
  PROFESSIONAL_NOT_APPROVED: "PROFESSIONAL_NOT_APPROVED",
  PROFESSIONAL_PENDING_APPROVAL: "PROFESSIONAL_PENDING_APPROVAL",

  // Booking Errors
  BOOKING_NOT_FOUND: "BOOKING_NOT_FOUND",
  BOOKING_SLOT_UNAVAILABLE: "BOOKING_SLOT_UNAVAILABLE",
  BOOKING_CANNOT_CANCEL: "BOOKING_CANNOT_CANCEL",
  BOOKING_CANNOT_RESCHEDULE: "BOOKING_CANNOT_RESCHEDULE",

  // Review Errors
  REVIEW_NOT_FOUND: "REVIEW_NOT_FOUND",
  REVIEW_ALREADY_EXISTS: "REVIEW_ALREADY_EXISTS",
  REVIEW_NOT_ALLOWED: "REVIEW_NOT_ALLOWED",

  // Enquiry Errors
  ENQUIRY_NOT_FOUND: "ENQUIRY_NOT_FOUND",
  ENQUIRY_ALREADY_EXISTS: "ENQUIRY_ALREADY_EXISTS",

  // File Errors
  FILE_TOO_LARGE: "FILE_TOO_LARGE",
  FILE_INVALID_TYPE: "FILE_INVALID_TYPE",
  FILE_UPLOAD_FAILED: "FILE_UPLOAD_FAILED",

  // General Errors
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
};

// Days of Week
export const DAYS_OF_WEEK = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

// Default Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
};

// Cache TTL (in seconds)
export const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
};

// Buffer Times (in minutes)
export const BUFFER_TIMES = {
  MIN: 15,
  DEFAULT: 30,
  MAX: 120,
};

// Booking Notice (in hours)
export const BOOKING_NOTICE = {
  MIN: 1,
  DEFAULT: 24,
  MAX: 168, // 1 week
};

// Advance Booking (in days)
export const ADVANCE_BOOKING = {
  MIN: 1,
  DEFAULT: 60,
  MAX: 365,
};
