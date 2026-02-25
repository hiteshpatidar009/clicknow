import User from "../models/User.js";

function toPlain(doc) {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : doc;
  const { _id, __v, ...rest } = obj;
  return { id: String(_id), ...rest };
}

class UserRepository {
  async create(data) {
    const doc = await User.create(data);
    return toPlain(doc);
  }

  async findById(id) {
    if (!id) return null;
    try {
      const doc = await User.findById(id);
      return toPlain(doc);
    } catch (e) {
      // id is not a valid ObjectId (e.g. Firebase UID or dev fallback) — try findOne
      if (e.name === 'CastError') {
        const doc = await User.findOne({ _id: id }).catch(() => null);
        return toPlain(doc);
      }
      throw e;
    }
  }

  async findByField(field, value) {
    const doc = await User.findOne({ [field]: value });
    return toPlain(doc);
  }

  async findByEmail(email) {
    return this.findByField("email", (email || "").toLowerCase());
  }

  async findByPhone(phone) {
    return this.findByField("phone", phone);
  }

  async findByFirebaseUid(firebaseUid) {
    return this.findByField("firebaseUid", firebaseUid);
  }

  async update(id, data) {
    if (!id) return null;
    try {
      const doc = await User.findByIdAndUpdate(
        id,
        { ...data, updatedAt: new Date() },
        { returnDocument: 'after' },
      );
      return toPlain(doc);
    } catch (e) {
      if (e.name === 'CastError') return null;
      throw e;
    }
  }

  async softDelete(id) {
    return this.update(id, { isDeleted: true, isActive: false });
  }

  async findAll(options = {}) {
    const { where = [], orderBy = null, orderDirection = "asc", limit = null } = options;
    const query = {};

    for (const condition of where) {
      const { field, operator, value } = condition;
      if (operator === "==") {
        query[field] = value;
      }
      if (operator === "array-contains") {
        query[field] = value;
      }
      if (operator === ">=") {
        query[field] = { ...(query[field] || {}), $gte: value };
      }
      if (operator === "<=") {
        query[field] = { ...(query[field] || {}), $lte: value };
      }
    }

    let q = User.find(query);
    if (orderBy) {
      q = q.sort({ [orderBy]: orderDirection === "desc" ? -1 : 1 });
    }
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

    const query = {};
    for (const condition of where) {
      const { field, operator, value } = condition;
      if (operator === "==") {
        query[field] = value;
      }
      if (operator === "array-contains") {
        query[field] = value;
      }
      if (operator === ">=") {
        query[field] = { ...(query[field] || {}), $gte: value };
      }
      if (operator === "<=") {
        query[field] = { ...(query[field] || {}), $lte: value };
      }
    }

    const skip = Math.max(page - 1, 0) * pageSize;
    const [docs, totalCount] = await Promise.all([
      User.find(query)
        .sort({ [orderBy]: orderDirection === "desc" ? -1 : 1 })
        .skip(skip)
        .limit(pageSize),
      User.countDocuments(query),
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
    const query = {};
    for (const condition of where) {
      const { field, operator, value } = condition;
      if (operator === "==") {
        query[field] = value;
      }
    }
    return User.countDocuments(query);
  }

  async searchByName(searchTerm, options = {}) {
    const searchLower = (searchTerm || "").toLowerCase();
    const { page = 1, pageSize = 20, orderBy = "createdAt", orderDirection = "desc", where = [] } = options;

    const baseQuery = { isDeleted: false };
    for (const condition of where) {
      const { field, operator, value } = condition;
      if (operator === "==") baseQuery[field] = value;
    }

    const query = {
      ...baseQuery,
      $or: [
        { displayName: { $regex: searchLower, $options: "i" } },
        { firstName: { $regex: searchLower, $options: "i" } },
        { lastName: { $regex: searchLower, $options: "i" } },
        { email: { $regex: searchLower, $options: "i" } },
      ],
    };

    const skip = Math.max(page - 1, 0) * pageSize;
    const [docs, totalCount] = await Promise.all([
      User.find(query)
        .sort({ [orderBy]: orderDirection === "desc" ? -1 : 1 })
        .skip(skip)
        .limit(pageSize),
      User.countDocuments(query),
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

  async findActiveUsers(options = {}) {
    return this.findPaginated({
      ...options,
      where: [
        { field: "isActive", operator: "==", value: true },
        { field: "isDeleted", operator: "==", value: false },
        ...(options.where || []),
      ],
    });
  }

  async updateLastLogin(id) {
    return this.update(id, { lastLoginAt: new Date() });
  }

  async updateVerificationStatus(id, isVerified) {
    return this.update(id, {
      isVerified,
      verifiedAt: isVerified ? new Date() : null,
    });
  }

  async updateFcmToken(id, fcmToken) {
    return this.update(id, { fcmToken });
  }

  async deactivateUser(id) {
    return this.update(id, {
      isActive: false,
      deactivatedAt: new Date(),
    });
  }

  async reactivateUser(id) {
    return this.update(id, {
      isActive: true,
      deactivatedAt: null,
    });
  }

  async getStatistics() {
    const [totalUsers, activeUsers, clients, professionals] = await Promise.all([
      User.countDocuments({ isDeleted: false }),
      User.countDocuments({ isActive: true, isDeleted: false }),
      User.countDocuments({ role: "client", isDeleted: false }),
      User.countDocuments({ role: "professional", isDeleted: false }),
    ]);

    return { totalUsers, activeUsers, clients, professionals };
  }

  async getUserGrowthOverTime(startDate, endDate, groupBy = "day") {
    const dateFormat = groupBy === "month" ? "%Y-%m" : "%Y-%m-%d";
    return User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }
}

export default new UserRepository();
