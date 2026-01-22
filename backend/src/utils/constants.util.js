/**
 * Constants
 */

export const COLLECTIONS = {
  USERS: "users",
  PROFESSIONALS: "professionals",
  BOOKINGS: "bookings",
  REVIEWS: "reviews",
  AVAILABILITY: "availability",
  ENQUIRIES: "enquiries",
  NOTIFICATIONS: "notifications",
  CHATS: "chats",
  MESSAGES: "messages",
  POSTS: "posts",
  COMMENTS: "comments",
  FOLLOWS: "follows",
};

export const USER_ROLES = {
  CLIENT: "client",
  PROFESSIONAL: "professional",
  ADMIN: "admin",
};

export const PROFESSIONAL_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  SUSPENDED: "suspended",
};

export const BOOKING_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  REJECTED: "rejected",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
  RESCHEDULED: "rescheduled",
};

export const REVIEW_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  REPORTED: "reported",
};

export const ENQUIRY_STATUS = {
  PENDING: "pending",
  RESPONDED: "responded",
  CONVERTED: "converted",
  CLOSED: "closed",
};

export const NOTIFICATION_TYPES = {
  BOOKING: "booking",
  REVIEW: "review",
  CHAT: "chat",
  SYSTEM: "system",
  MARKETING: "marketing",
  POST_LIKE: "post_like",
  POST_COMMENT: "post_comment",
  NEW_FOLLOWER: "new_follower",
  JOB_MATCH: "job_match",
};

export const PROFESSIONAL_CATEGORIES = {
  PHOTOGRAPHER: "photographer",
  VIDEOGRAPHER: "videographer",
  GUITARIST: "guitarist",
  MUSICIAN: "musician",
  MAGICIAN: "magician",
  DJ: "dj",
  DANCER: "dancer",
  MAKEUP_ARTIST: "makeup_artist",
  DECORATOR: "decorator",
  CATERER: "caterer",
};

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

export default {
  COLLECTIONS,
  USER_ROLES,
  PROFESSIONAL_STATUS,
  BOOKING_STATUS,
  REVIEW_STATUS,
  ENQUIRY_STATUS,
  NOTIFICATION_TYPES,
  PROFESSIONAL_CATEGORIES,
  HTTP_STATUS,
};
