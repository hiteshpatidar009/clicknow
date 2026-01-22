import crypto from "crypto";

class Helpers {
  generateRandomString = (length = 32) => {
    return crypto.randomBytes(length).toString("hex").slice(0, length);
  };

  generateOTP = (length = 6) => {
    const digits = "0123456789";
    let otp = "";
    for (let i = 0; i < length; i++) {
      otp += digits[Math.floor(Math.random() * digits.length)];
    }
    return otp;
  };

  slugify = (text) => {
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

  capitalizeFirst = (string) => {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  titleCase = (string) => {
    if (!string) return "";
    return string
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  parseBoolean = (value) => {
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
      return ["true", "1", "yes"].includes(value.toLowerCase());
    }
    return !!value;
  };

  parseIntSafe = (value, defaultValue = 0) => {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  };

  parseFloatSafe = (value, defaultValue = 0) => {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  };

  deepClone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
  };

  cleanObject = (obj) => {
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined && value !== null) {
        cleaned[key] = value;
      }
    }
    return cleaned;
  };

  pick = (obj, keys) => {
    const picked = {};
    for (const key of keys) {
      if (obj.hasOwnProperty(key)) {
        picked[key] = obj[key];
      }
    }
    return picked;
  };

  omit = (obj, keys) => {
    const omitted = { ...obj };
    for (const key of keys) {
      delete omitted[key];
    }
    return omitted;
  };

  isEmpty = (obj) => {
    if (!obj) return true;
    if (Array.isArray(obj)) return obj.length === 0;
    if (typeof obj === "object") return Object.keys(obj).length === 0;
    return false;
  };

  delay = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
    let lastError;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        if (i < maxRetries - 1) {
          const delayTime = baseDelay * Math.pow(2, i);
          await this.delay(delayTime);
        }
      }
    }

    throw lastError;
  };

  formatCurrency = (amount, currency = "INR", locale = "en-IN") => {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    }).format(amount);
  };

  formatDate = (date, options = {}, locale = "en-IN") => {
    const defaultOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      ...options,
    };

    return new Intl.DateTimeFormat(locale, defaultOptions).format(
      new Date(date),
    );
  };

  formatTime = (time, is24Hour = false) => {
    if (!time) return "";

    const [hours, minutes] = time.split(":").map(Number);

    if (is24Hour) {
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
    }

    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;

    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  calculateDuration = (startTime, endTime) => {
    const [startHours, startMinutes] = startTime.split(":").map(Number);
    const [endHours, endMinutes] = endTime.split(":").map(Number);

    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;

    return endTotalMinutes - startTotalMinutes;
  };

  addMinutesToTime = (time, minutes) => {
    const [hours, mins] = time.split(":").map(Number);
    const totalMinutes = hours * 60 + mins + minutes;

    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMinutes = totalMinutes % 60;

    return `${newHours.toString().padStart(2, "0")}:${newMinutes.toString().padStart(2, "0")}`;
  };

  isTimeInRange = (time, startTime, endTime) => {
    const timeMinutes = this.timeToMinutes(time);
    const startMinutes = this.timeToMinutes(startTime);
    const endMinutes = this.timeToMinutes(endTime);

    return timeMinutes >= startMinutes && timeMinutes <= endMinutes;
  };

  timeToMinutes = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  minutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60) % 24;
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
  };

  calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  toRadians = (degrees) => {
    return degrees * (Math.PI / 180);
  };

  maskEmail = (email) => {
    if (!email) return "";
    const [name, domain] = email.split("@");
    const maskedName =
      name.charAt(0) +
      "*".repeat(Math.max(1, name.length - 2)) +
      name.charAt(name.length - 1);
    return `${maskedName}@${domain}`;
  };

  maskPhone = (phone) => {
    if (!phone) return "";
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length < 4) return phone;
    return "*".repeat(cleaned.length - 4) + cleaned.slice(-4);
  };

  generateSearchTerms = (text) => {
    if (!text) return [];

    const terms = new Set();
    const words = text.toLowerCase().split(/\s+/);

    for (const word of words) {
      if (word.length > 1) {
        terms.add(word);

        for (let i = 2; i <= word.length; i++) {
          terms.add(word.substring(0, i));
        }
      }
    }

    return Array.from(terms);
  };

  paginateArray = (array, page = 1, pageSize = 20) => {
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
}

export default new Helpers();
export const { cleanObject } = new Helpers();
