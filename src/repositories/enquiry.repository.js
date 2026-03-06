import Enquiry from "../models/Enquiry.js";

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

class EnquiryRepository {
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
    const doc = await Enquiry.create(data);
    return toPlain(doc);
  }

  async findById(id) {
    return toPlain(await Enquiry.findById(id));
  }

  async update(id, data) {
    return toPlain(
      await Enquiry.findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { returnDocument: "after" }),
    );
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
      Enquiry.find(query)
        .sort({ [orderBy]: orderDirection === "desc" ? -1 : 1 })
        .skip(skip)
        .limit(pageSize),
      Enquiry.countDocuments(query),
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
    return Enquiry.countDocuments(this.whereToMongo(where));
  }

  async findByClientId(clientId, options = {}) {
    return this.findPaginated({
      ...options,
      where: [
        { field: "clientId", operator: "==", value: clientId },
        { field: "isDeleted", operator: "==", value: false },
      ],
      orderBy: "createdAt",
      orderDirection: "desc",
    });
  }

  async findByProfessionalId(professionalId, options = {}) {
    return this.findPaginated({
      ...options,
      where: [
        { field: "professionalId", operator: "==", value: professionalId },
        { field: "isDeleted", operator: "==", value: false },
      ],
      orderBy: "createdAt",
      orderDirection: "desc",
    });
  }

  async findPendingByProfessional(professionalId, options = {}) {
    return this.findPaginated({
      ...options,
      where: [
        { field: "professionalId", operator: "==", value: professionalId },
        { field: "status", operator: "==", value: "pending" },
        { field: "isDeleted", operator: "==", value: false },
      ],
      orderBy: "createdAt",
      orderDirection: "desc",
    });
  }

  async findAllEnquiries(options = {}) {
    const where = [{ field: "isDeleted", operator: "==", value: false }];
    if (options.status) where.push({ field: "status", operator: "==", value: options.status });
    if (options.professionalId) where.push({ field: "professionalId", operator: "==", value: options.professionalId });
    if (options.clientId) where.push({ field: "clientId", operator: "==", value: options.clientId });
    if (options.startDate) where.push({ field: "createdAt", operator: ">=", value: new Date(options.startDate) });
    if (options.endDate) where.push({ field: "createdAt", operator: "<=", value: new Date(options.endDate) });

    return this.findPaginated({
      page: options.page || 1,
      pageSize: options.pageSize || 20,
      orderBy: options.orderBy || "createdAt",
      orderDirection: options.orderDirection || "desc",
      where,
    });
  }

  async getStatistics() {
    const [total, pending, responded, converted] = await Promise.all([
      this.count([{ field: "isDeleted", operator: "==", value: false }]),
      this.count([
        { field: "status", operator: "==", value: "pending" },
        { field: "isDeleted", operator: "==", value: false },
      ]),
      this.count([
        { field: "status", operator: "==", value: "responded" },
        { field: "isDeleted", operator: "==", value: false },
      ]),
      this.count([
        { field: "status", operator: "==", value: "converted" },
        { field: "isDeleted", operator: "==", value: false },
      ]),
    ]);

    return { total, pending, responded, converted };
  }
}

export default new EnquiryRepository();
