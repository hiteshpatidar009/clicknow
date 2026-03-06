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
  CATEGORIES: "categories",
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

export const USER_ROLES = {
  ADMIN: "admin",
  PROFESSIONAL: "professional",
  CLIENT: "client",
};

export const PROFESSIONAL_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended', // Admin suspended — user role downgraded to client
};


export const PROFESSIONAL_CATEGORIES = {
  PHOTOGRAPHER: "photographer",
  VIDEOGRAPHER: "videographer",
  CINEMATOGRAPHER: "cinematographer",
  EDITOR: "editor",
};

export const BOOKING_STATUS = {
  PENDING: "pending",
  OPEN: "open",
  ASSIGNED: "assigned",
  PROCESSING: "processing",
  CONFIRMED: "confirmed",
  REJECTED: "rejected",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
  RESCHEDULED: "rescheduled",
};

export const ENQUIRY_STATUS = {
  PENDING: "pending",
  RESPONDED: "responded",
  CONVERTED: "converted",
  CLOSED: "closed",
};

export const REVIEW_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  REPORTED: "reported",
};

export const NOTIFICATION_TYPES = {
  BOOKING: "booking",
  REVIEW: "review",
  ENQUIRY: "enquiry",
  REMINDER: "reminder",
  SYSTEM: "system",
  MARKETING: "marketing",
};
