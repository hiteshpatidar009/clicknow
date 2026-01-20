/**
 * Helper Utilities
 * Common utility functions
 */

import crypto from "crypto";

/**
 * Generate random string
 * @param {number} length - String length
 * @returns {string} Random string
 */
export const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString("hex").slice(0, length);
};

/**
 * Generate OTP
 * @param {number} length - OTP length
 * @returns {string} OTP
 */
export const generateOTP = (length = 6) => {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  return otp;
};

/**
 * Slugify string
 * @param {string} text - Text to slugify
 * @returns {string} Slugified string
 */
export const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
};

/**
 * Capitalize first letter
 * @param {string} string - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalizeFirst = (string) => {
  if (!string) return "";
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

/**
 * Capitalize all words
 * @param {string} string - String to capitalize
 * @returns {string} Title case string
 */
export const titleCase = (string) => {
  if (!string) return "";
  return string
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

/**
 * Parse boolean from string
 * @param {any} value - Value to parse
 * @returns {boolean} Boolean value
 */
export const parseBoolean = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    return ["true", "1", "yes"].includes(value.toLowerCase());
  }
  return !!value;
};

/**
 * Parse integer safely
 * @param {any} value - Value to parse
 * @param {number} defaultValue - Default value
 * @returns {number} Integer value
 */
export const parseIntSafe = (value, defaultValue = 0) => {
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * Parse float safely
 * @param {any} value - Value to parse
 * @param {number} defaultValue - Default value
 * @returns {number} Float value
 */
export const parseFloatSafe = (value, defaultValue = 0) => {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * Deep clone object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Remove undefined and null values from object
 * @param {Object} obj - Object to clean
 * @returns {Object} Cleaned object
 */
export const cleanObject = (obj) => {
  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null) {
      cleaned[key] = value;
    }
  }
  return cleaned;
};

/**
 * Pick specific keys from object
 * @param {Object} obj - Source object
 * @param {Array} keys - Keys to pick
 * @returns {Object} Object with picked keys
 */
export const pick = (obj, keys) => {
  const picked = {};
  for (const key of keys) {
    if (obj.hasOwnProperty(key)) {
      picked[key] = obj[key];
    }
  }
  return picked;
};

/**
 * Omit specific keys from object
 * @param {Object} obj - Source object
 * @param {Array} keys - Keys to omit
 * @returns {Object} Object without omitted keys
 */
export const omit = (obj, keys) => {
  const omitted = { ...obj };
  for (const key of keys) {
    delete omitted[key];
  }
  return omitted;
};

/**
 * Check if object is empty
 * @param {Object} obj - Object to check
 * @returns {boolean} Is empty
 */
export const isEmpty = (obj) => {
  if (!obj) return true;
  if (Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === "object") return Object.keys(obj).length === 0;
  return false;
};

/**
 * Delay execution
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} Promise that resolves after delay
 */
export const delay = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Retry function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum retries
 * @param {number} baseDelay - Base delay in ms
 * @returns {Promise} Result of function
 */
export const retryWithBackoff = async (
  fn,
  maxRetries = 3,
  baseDelay = 1000,
) => {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        const delayTime = baseDelay * Math.pow(2, i);
        await delay(delayTime);
      }
    }
  }

  throw lastError;
};

/**
 * Format currency
 * @param {number} amount - Amount
 * @param {string} currency - Currency code
 * @param {string} locale - Locale
 * @returns {string} Formatted currency
 */
export const formatCurrency = (amount, currency = "INR", locale = "en-IN") => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
};

/**
 * Format date
 * @param {Date|string} date - Date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @param {string} locale - Locale
 * @returns {string} Formatted date
 */
export const formatDate = (date, options = {}, locale = "en-IN") => {
  const defaultOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  };

  return new Intl.DateTimeFormat(locale, defaultOptions).format(new Date(date));
};

/**
 * Format time
 * @param {string} time - Time string (HH:mm)
 * @param {boolean} is24Hour - Use 24-hour format
 * @returns {string} Formatted time
 */
export const formatTime = (time, is24Hour = false) => {
  if (!time) return "";

  const [hours, minutes] = time.split(":").map(Number);

  if (is24Hour) {
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  }

  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;

  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
};

/**
 * Calculate duration between two times
 * @param {string} startTime - Start time (HH:mm)
 * @param {string} endTime - End time (HH:mm)
 * @returns {number} Duration in minutes
 */
export const calculateDuration = (startTime, endTime) => {
  const [startHours, startMinutes] = startTime.split(":").map(Number);
  const [endHours, endMinutes] = endTime.split(":").map(Number);

  const startTotalMinutes = startHours * 60 + startMinutes;
  const endTotalMinutes = endHours * 60 + endMinutes;

  return endTotalMinutes - startTotalMinutes;
};

/**
 * Add minutes to time
 * @param {string} time - Time string (HH:mm)
 * @param {number} minutes - Minutes to add
 * @returns {string} New time string
 */
export const addMinutesToTime = (time, minutes) => {
  const [hours, mins] = time.split(":").map(Number);
  const totalMinutes = hours * 60 + mins + minutes;

  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMinutes = totalMinutes % 60;

  return `${newHours.toString().padStart(2, "0")}:${newMinutes.toString().padStart(2, "0")}`;
};

/**
 * Check if time is within range
 * @param {string} time - Time to check (HH:mm)
 * @param {string} startTime - Range start (HH:mm)
 * @param {string} endTime - Range end (HH:mm)
 * @returns {boolean} Is within range
 */
export const isTimeInRange = (time, startTime, endTime) => {
  const timeMinutes = timeToMinutes(time);
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);

  return timeMinutes >= startMinutes && timeMinutes <= endMinutes;
};

/**
 * Convert time string to minutes
 * @param {string} time - Time string (HH:mm)
 * @returns {number} Total minutes
 */
export const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

/**
 * Convert minutes to time string
 * @param {number} minutes - Total minutes
 * @returns {string} Time string (HH:mm)
 */
export const minutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60) % 24;
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 * @param {number} lat1 - Latitude 1
 * @param {number} lon1 - Longitude 1
 * @param {number} lat2 - Latitude 2
 * @param {number} lon2 - Longitude 2
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

/**
 * Convert degrees to radians
 * @param {number} degrees - Degrees
 * @returns {number} Radians
 */
export const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

/**
 * Mask email address
 * @param {string} email - Email address
 * @returns {string} Masked email
 */
export const maskEmail = (email) => {
  if (!email) return "";
  const [name, domain] = email.split("@");
  const maskedName =
    name.charAt(0) +
    "*".repeat(Math.max(1, name.length - 2)) +
    name.charAt(name.length - 1);
  return `${maskedName}@${domain}`;
};

/**
 * Mask phone number
 * @param {string} phone - Phone number
 * @returns {string} Masked phone
 */
export const maskPhone = (phone) => {
  if (!phone) return "";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length < 4) return phone;
  return "*".repeat(cleaned.length - 4) + cleaned.slice(-4);
};

/**
 * Generate search terms from text
 * @param {string} text - Text to process
 * @returns {Array} Search terms
 */
export const generateSearchTerms = (text) => {
  if (!text) return [];

  const terms = new Set();
  const words = text.toLowerCase().split(/\s+/);

  for (const word of words) {
    if (word.length > 1) {
      terms.add(word);
      // Add prefixes for autocomplete
      for (let i = 2; i <= word.length; i++) {
        terms.add(word.substring(0, i));
      }
    }
  }

  return Array.from(terms);
};

/**
 * Paginate array
 * @param {Array} array - Array to paginate
 * @param {number} page - Page number
 * @param {number} pageSize - Page size
 * @returns {Object} Paginated result
 */
export const paginateArray = (array, page = 1, pageSize = 20) => {
  const totalCount = array.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  return {
    data: array.slice(startIndex, endIndex),
    pagination: {
      page,
      pageSize,
      totalCount,
      totalPages,
      hasMore: page < totalPages,
    },
  };
};

export default {
  generateRandomString,
  generateOTP,
  slugify,
  capitalizeFirst,
  titleCase,
  parseBoolean,
  parseIntSafe,
  parseFloatSafe,
  deepClone,
  cleanObject,
  pick,
  omit,
  isEmpty,
  delay,
  retryWithBackoff,
  formatCurrency,
  formatDate,
  formatTime,
  calculateDuration,
  addMinutesToTime,
  isTimeInRange,
  timeToMinutes,
  minutesToTime,
  calculateDistance,
  toRadians,
  maskEmail,
  maskPhone,
  generateSearchTerms,
  paginateArray,
};
