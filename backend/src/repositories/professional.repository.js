import Professional from "../models/Professional.js";
import Review from "../models/Review.js";
import mongoose from "mongoose";
import { PROFESSIONAL_STATUS } from "../utils/constants.util.js";

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

class ProfessionalRepository {
  async create(data) {
    const doc = await Professional.create(data);
    return toPlain(doc);
  }

  async findById(id) {
    const doc = await Professional.findById(id);
    return toPlain(doc);
  }

  async findByField(field, value) {
    const doc = await Professional.findOne({ [field]: value });
    return toPlain(doc);
  }

  async update(id, data) {
    const doc = await Professional.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { returnDocument: "after" },
    );
    return toPlain(doc);
  }

  async findAll(options = {}) {
    const { where = [], orderBy = null, orderDirection = "asc", limit = null } = options;
    const query = this.whereToMongo(where);
    let q = Professional.find(query);
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
      Professional.find(query)
        .sort({ [orderBy]: orderDirection === "desc" ? -1 : 1 })
        .skip(skip)
        .limit(pageSize),
      Professional.countDocuments(query),
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
    return Professional.countDocuments(this.whereToMongo(where));
  }

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
        case "array-contains":
          query[field] = value;
          break;
      }
    }
    return query;
  }

  async findByUserId(userId) {
    return this.findByField("userId", userId);
  }

  async findByCategory(category, options = {}) {
    return this.findPaginated({
      ...options,
      where: [
        { field: "category", operator: "==", value: category },
        { field: "status", operator: "==", value: PROFESSIONAL_STATUS.APPROVED },
        { field: "isActive", operator: "==", value: true },
        { field: "isDeleted", operator: "==", value: false },
        ...(options.where || []),
      ],
    });
  }

  async findBySpecialty(specialty, options = {}) {
    return this.findPaginated({
      ...options,
      where: [
        { field: "specialties", operator: "array-contains", value: specialty },
        { field: "status", operator: "==", value: PROFESSIONAL_STATUS.APPROVED },
        { field: "isActive", operator: "==", value: true },
        { field: "isDeleted", operator: "==", value: false },
        ...(options.where || []),
      ],
    });
  }

  async findByCity(city, options = {}) {
    return this.findPaginated({
      ...options,
      where: [
        { field: "location.city", operator: "==", value: (city || "").toLowerCase() },
        { field: "status", operator: "==", value: PROFESSIONAL_STATUS.APPROVED },
        { field: "isActive", operator: "==", value: true },
        { field: "isDeleted", operator: "==", value: false },
        ...(options.where || []),
      ],
    });
  }

  async findByServiceArea(area, options = {}) {
    return this.findPaginated({
      ...options,
      where: [
        { field: "serviceAreas", operator: "array-contains", value: (area || "").toLowerCase() },
        { field: "status", operator: "==", value: PROFESSIONAL_STATUS.APPROVED },
        { field: "isActive", operator: "==", value: true },
        { field: "isDeleted", operator: "==", value: false },
        ...(options.where || []),
      ],
    });
  }

  async findFeatured(options = {}) {
    return this.findPaginated({
      ...options,
      where: [
        { field: "isFeatured", operator: "==", value: true },
        { field: "status", operator: "==", value: PROFESSIONAL_STATUS.APPROVED },
        { field: "isActive", operator: "==", value: true },
        { field: "isDeleted", operator: "==", value: false },
        ...(options.where || []),
      ],
      orderBy: "featuredOrder",
      orderDirection: "asc",
    });
  }

  async findPendingApproval(options = {}) {
    return this.findPaginated({
      ...options,
      where: [
        { field: "status", operator: "==", value: PROFESSIONAL_STATUS.PENDING },
        { field: "isDeleted", operator: "==", value: false },
        ...(options.where || []),
      ],
      orderBy: "createdAt",
      orderDirection: "asc",
    });
  }

  async findTopRated(limit = 10) {
    return this.findAll({
      where: [
        { field: "status", operator: "==", value: PROFESSIONAL_STATUS.APPROVED },
        { field: "isActive", operator: "==", value: true },
        { field: "isDeleted", operator: "==", value: false },
        { field: "stats.totalReviews", operator: ">=", value: 1 },
      ],
      orderBy: "stats.averageRating",
      orderDirection: "desc",
      limit,
    });
  }

  async updateStatus(id, status, reason = null) {
    const updateData = { status, statusUpdatedAt: new Date() };
    if (reason) updateData.statusReason = reason;
    if (status === PROFESSIONAL_STATUS.APPROVED) updateData.approvedAt = new Date();
    if (status === PROFESSIONAL_STATUS.REJECTED) updateData.rejectedAt = new Date();
    return this.update(id, updateData);
  }

  async updateVerification(id, isVerified) {
    return this.update(id, { isVerified, verifiedAt: isVerified ? new Date() : null });
  }

  async setFeatured(id, isFeatured, order = null) {
    const data = { isFeatured };
    if (order !== null) data.featuredOrder = order;
    return this.update(id, data);
  }

  async updateStats(id, stats) {
    const data = {};
    for (const [k, v] of Object.entries(stats)) data[`stats.${k}`] = v;
    return this.update(id, data);
  }

  async incrementField(id, field, value = 1) {
    const doc = await Professional.findByIdAndUpdate(
      id,
      { $inc: { [field]: value } },
      { returnDocument: "after" },
    );
    return toPlain(doc);
  }

  async incrementBookingCount(id) {
    return this.incrementField(id, "stats.totalBookings", 1);
  }

  async updateRatingStats(id, averageRating, totalReviews) {
    return this.update(id, {
      "stats.averageRating": averageRating,
      "stats.totalReviews": totalReviews,
    });
  }

  async updateRating(professionalId) {
    const professionalObjectId =
      mongoose.Types.ObjectId.isValid(professionalId) ?
        new mongoose.Types.ObjectId(professionalId)
      : professionalId;
    const rows = await Review.aggregate([
      { $match: { professionalId: professionalObjectId, isDeleted: false, status: "approved" } },
      {
        $group: {
          _id: "$professionalId",
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    const averageRating = rows[0]?.averageRating || 0;
    const totalReviews = rows[0]?.totalReviews || 0;

    return this.update(professionalId, {
      "stats.averageRating": Number(averageRating.toFixed(2)),
      "stats.totalReviews": totalReviews,
    });
  }

  async addPortfolioItem(id, portfolioItem) {
    const doc = await Professional.findByIdAndUpdate(
      id,
      { $push: { portfolio: portfolioItem } },
      { returnDocument: "after" },
    );
    return toPlain(doc);
  }

  async removePortfolioItem(id, portfolioItem) {
    const doc = await Professional.findByIdAndUpdate(
      id,
      { $pull: { portfolio: { id: portfolioItem.id } } },
      { returnDocument: "after" },
    );
    return toPlain(doc);
  }

  async search(filters, options = {}) {
    const where = [
      { field: "status", operator: "==", value: PROFESSIONAL_STATUS.APPROVED },
      { field: "isActive", operator: "==", value: true },
      { field: "isDeleted", operator: "==", value: false },
    ];

    if (filters.category) where.push({ field: "category", operator: "==", value: filters.category });
    if (filters.specialty) where.push({ field: "specialties", operator: "array-contains", value: filters.specialty });
    if (filters.city) where.push({ field: "location.city", operator: "==", value: String(filters.city).toLowerCase() });
    if (filters.state) where.push({ field: "location.state", operator: "==", value: String(filters.state).toLowerCase() });
    if (filters.minRating) where.push({ field: "stats.averageRating", operator: ">=", value: Number(filters.minRating) });
    if (filters.maxPrice) where.push({ field: "pricing.hourlyRate", operator: "<=", value: Number(filters.maxPrice) });
    if (filters.minPrice) where.push({ field: "pricing.hourlyRate", operator: ">=", value: Number(filters.minPrice) });

    return this.findPaginated({
      page: options.page || 1,
      pageSize: options.pageSize || options.limit || 20,
      orderBy: options.orderBy || "stats.averageRating",
      orderDirection: options.orderDirection || "desc",
      where,
    });
  }

  async adminSearch(filters = {}, options = {}) {
    const where = [{ field: "isDeleted", operator: "==", value: false }];
    if (filters.status) where.push({ field: "status", operator: "==", value: String(filters.status).toLowerCase() });
    if (filters.category) where.push({ field: "category", operator: "==", value: String(filters.category).toLowerCase() });

    if (filters.search) {
      const query = this.whereToMongo(where);
      query.$or = [
        { businessName: { $regex: filters.search, $options: "i" } },
        { "location.city": { $regex: filters.search, $options: "i" } },
      ];
      const page = options.page || 1;
      const pageSize = options.pageSize || 20;
      const skip = (page - 1) * pageSize;
      const [docs, totalCount] = await Promise.all([
        Professional.find(query)
          .sort({ [options.orderBy || "createdAt"]: options.orderDirection === "asc" ? 1 : -1 })
          .skip(skip)
          .limit(pageSize),
        Professional.countDocuments(query),
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

    return this.findPaginated({
      page: options.page || 1,
      pageSize: options.pageSize || 20,
      orderBy: options.orderBy || "createdAt",
      orderDirection: options.orderDirection || "desc",
      where,
    });
  }

  async searchByName(query, options = {}) {
    const mongoQuery = {
      isDeleted: false,
      isActive: true,
      status: PROFESSIONAL_STATUS.APPROVED,
      businessName: { $regex: query, $options: "i" },
    };
    const limit = options.limit || 5;
    const docs = await Professional.find(mongoQuery).limit(limit);
    return docs.map(toPlain);
  }

  async getCategoryStats() {
    const rows = await Professional.aggregate([
      { $match: { isDeleted: false, status: PROFESSIONAL_STATUS.APPROVED } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    const stats = {};
    rows.forEach((row) => {
      stats[row._id || "unknown"] = row.count;
    });
    return stats;
  }

  async getStatistics() {
    const [total, approved, pending, rejected, featured, byCategory] = await Promise.all([
      Professional.countDocuments({ isDeleted: false }),
      Professional.countDocuments({ status: PROFESSIONAL_STATUS.APPROVED, isDeleted: false }),
      Professional.countDocuments({ status: PROFESSIONAL_STATUS.PENDING, isDeleted: false }),
      Professional.countDocuments({ status: PROFESSIONAL_STATUS.REJECTED, isDeleted: false }),
      Professional.countDocuments({ isFeatured: true, isDeleted: false }),
      this.getCategoryStats(),
    ]);

    return { total, approved, pending, rejected, featured, byCategory };
  }
}

export default new ProfessionalRepository();
