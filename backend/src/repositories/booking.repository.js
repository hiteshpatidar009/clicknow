import Booking from "../models/Booking.js";
import { BOOKING_STATUS } from "../utils/constants.util.js";

function serialize(value) {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map(serialize);
  if (value instanceof Date) return value;
  if (typeof value === "object") {
    if (typeof value.toHexString === "function") return value.toString();
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = serialize(v);
    return out;
  }
  return value;
}

function toPlain(doc) {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : doc;
  const { _id, __v, ...rest } = obj;
  return serialize({ id: String(_id), ...rest });
}

class BookingRepository {
  whereToMongo(where = []) {
    const query = {};
    for (const condition of where) {
      const { field, operator, value } = condition;
      switch (operator) {
        case "==":
          query[field] = value;
          break;
        case ">=":
          query[field] = { ...(query[field] || {}), $gte: value };
          break;
        case "<=":
          query[field] = { ...(query[field] || {}), $lte: value };
          break;
        case "in":
          query[field] = { $in: value };
          break;
      }
    }
    return query;
  }

  async create(data) {
    const doc = await Booking.create(data);
    return toPlain(doc);
  }

  async findById(id) {
    return toPlain(await Booking.findById(id));
  }

  async update(id, data) {
    return toPlain(
      await Booking.findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { returnDocument: "after" }),
    );
  }

  async findAll(options = {}) {
    const { where = [], orderBy = null, orderDirection = "asc", limit = null } = options;
    const query = this.whereToMongo(where);
    let q = Booking.find(query);
    if (orderBy) q = q.sort({ [orderBy]: orderDirection === "desc" ? -1 : 1 });
    if (limit) q = q.limit(limit);
    const docs = await q;
    return docs.map(toPlain);
  }

  async findPaginated(options = {}) {
    const {
      where = [],
      orderBy = "createdAt",
      orderDirection = "desc",
      page = 1,
      pageSize = 20,
    } = options;
    const query = this.whereToMongo(where);
    const skip = Math.max(page - 1, 0) * pageSize;
    const [docs, totalCount] = await Promise.all([
      Booking.find(query)
        .sort({ [orderBy]: orderDirection === "desc" ? -1 : 1 })
        .skip(skip)
        .limit(pageSize),
      Booking.countDocuments(query),
    ]);
    return {
      data: docs.map(toPlain),
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize) || 1,
        hasMore: skip + docs.length < totalCount,
        nextCursor: null,
      },
    };
  }

  async count(where = []) {
    return Booking.countDocuments(this.whereToMongo(where));
  }

  async findByClientId(clientId, options = {}) {
    return this.findPaginated({
      ...options,
      where: [
        { field: "clientId", operator: "==", value: clientId },
        { field: "isDeleted", operator: "==", value: false },
        ...(options.where || []),
      ],
      orderBy: options.orderBy || "bookingDate",
      orderDirection: options.orderDirection || "desc",
    });
  }

  async findByProfessionalId(professionalId, options = {}) {
    return this.findPaginated({
      ...options,
      where: [
        { field: "professionalId", operator: "==", value: professionalId },
        { field: "isDeleted", operator: "==", value: false },
        ...(options.where || []),
      ],
      orderBy: options.orderBy || "bookingDate",
      orderDirection: options.orderDirection || "desc",
    });
  }

  async findByStatus(status, options = {}) {
    return this.findPaginated({
      ...options,
      where: [
        { field: "status", operator: "==", value: status },
        { field: "isDeleted", operator: "==", value: false },
        ...(options.where || []),
      ],
    });
  }

  async findByDate(professionalId, date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    return this.findAll({
      where: [
        { field: "professionalId", operator: "==", value: professionalId },
        { field: "bookingDate", operator: ">=", value: startOfDay },
        { field: "bookingDate", operator: "<=", value: endOfDay },
        {
          field: "status",
          operator: "in",
          value: [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.PROCESSING],
        },
        { field: "isDeleted", operator: "==", value: false },
      ],
    });
  }

  async findByDateRange(professionalId, startDate, endDate) {
    return this.findAll({
      where: [
        { field: "professionalId", operator: "==", value: professionalId },
        { field: "bookingDate", operator: ">=", value: startDate },
        { field: "bookingDate", operator: "<=", value: endDate },
        {
          field: "status",
          operator: "in",
          value: [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.PROCESSING],
        },
        { field: "isDeleted", operator: "==", value: false },
      ],
      orderBy: "bookingDate",
      orderDirection: "asc",
    });
  }

  async findUpcoming(professionalId, options = {}) {
    return this.findPaginated({
      ...options,
      where: [
        { field: "professionalId", operator: "==", value: professionalId },
        { field: "bookingDate", operator: ">=", value: new Date() },
        { field: "status", operator: "==", value: BOOKING_STATUS.CONFIRMED },
        { field: "isDeleted", operator: "==", value: false },
        ...(options.where || []),
      ],
      orderBy: "bookingDate",
      orderDirection: "asc",
    });
  }

  async findCompletedWithoutReview(clientId) {
    return this.findAll({
      where: [
        { field: "clientId", operator: "==", value: clientId },
        { field: "status", operator: "==", value: BOOKING_STATUS.COMPLETED },
        { field: "hasReview", operator: "==", value: false },
        { field: "isDeleted", operator: "==", value: false },
      ],
      orderBy: "completedAt",
      orderDirection: "desc",
    });
  }

  async updateStatus(id, status, reason = null) {
    const updateData = { status, statusUpdatedAt: new Date() };
    if (reason) updateData.statusReason = reason;
    switch (status) {
      case BOOKING_STATUS.CONFIRMED:
        updateData.confirmedAt = new Date();
        break;
      case BOOKING_STATUS.CANCELLED:
        updateData.cancelledAt = new Date();
        break;
      case BOOKING_STATUS.COMPLETED:
        updateData.completedAt = new Date();
        break;
      case BOOKING_STATUS.REJECTED:
        updateData.rejectedAt = new Date();
        break;
    }
    return this.update(id, updateData);
  }

  async hasTimeSlotConflict(professionalId, bookingDate, startTime, endTime, excludeBookingId = null) {
    if (!startTime || !endTime) return false;
    const dayBookings = await this.findByDate(professionalId, bookingDate);
    for (const booking of dayBookings) {
      if (excludeBookingId && booking.id === excludeBookingId) continue;
      if (!booking.startTime || !booking.endTime) continue;
      if (
        (startTime >= booking.startTime && startTime < booking.endTime) ||
        (endTime > booking.startTime && endTime <= booking.endTime) ||
        (startTime <= booking.startTime && endTime >= booking.endTime)
      ) {
        return true;
      }
    }
    return false;
  }

  async markAsReviewed(id, reviewId) {
    return this.update(id, { hasReview: true, reviewId });
  }

  async getStatusCountsForProfessional(professionalId) {
    const statuses = Object.values(BOOKING_STATUS);
    const counts = {};
    for (const status of statuses) {
      counts[status] = await this.count([
        { field: "professionalId", operator: "==", value: professionalId },
        { field: "status", operator: "==", value: status },
        { field: "isDeleted", operator: "==", value: false },
      ]);
    }
    return counts;
  }

  async findBookingsNeedingReminder(hoursAhead = 24) {
    const now = new Date();
    const reminderTime = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);
    return this.findAll({
      where: [
        { field: "bookingDate", operator: "<=", value: reminderTime },
        { field: "bookingDate", operator: ">=", value: now },
        { field: "status", operator: "==", value: BOOKING_STATUS.CONFIRMED },
        { field: "reminderSent", operator: "==", value: false },
        { field: "isDeleted", operator: "==", value: false },
      ],
    });
  }

  async markReminderSent(id) {
    return this.update(id, { reminderSent: true, reminderSentAt: new Date() });
  }

  async getStatistics(filters = {}) {
    const where = [{ field: "isDeleted", operator: "==", value: false }];
    if (filters.professionalId) where.push({ field: "professionalId", operator: "==", value: filters.professionalId });
    if (filters.clientId) where.push({ field: "clientId", operator: "==", value: filters.clientId });

    const statusCounts = {};
    for (const status of Object.values(BOOKING_STATUS)) {
      statusCounts[status] = await this.count([...where, { field: "status", operator: "==", value: status }]);
    }
    const total = await this.count(where);
    return { total, byStatus: statusCounts };
  }

  async getRevenueOverTime(startDate, endDate, groupBy = "day") {
    const dateFormat = groupBy === "month" ? "%Y-%m" : "%Y-%m-%d";
    const rows = await Booking.aggregate([
      {
        $match: {
          isDeleted: false,
          bookingDate: { $gte: startDate, $lte: endDate },
          status: { $in: [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.COMPLETED, BOOKING_STATUS.PROCESSING] },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: "$bookingDate" } },
          revenue: { $sum: { $ifNull: ["$pricing.totalAmount", 0] } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return {
      startDate,
      endDate,
      groupBy,
      series: rows.map((r) => ({ period: r._id, revenue: r.revenue, bookings: r.count })),
      totalRevenue: rows.reduce((acc, row) => acc + row.revenue, 0),
    };
  }
}

export default new BookingRepository();
