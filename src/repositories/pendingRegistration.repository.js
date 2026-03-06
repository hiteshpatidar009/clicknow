import PendingRegistration from "../models/PendingRegistration.js";

function toPlain(doc) {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : doc;
  const { _id, __v, ...rest } = obj;
  return { id: String(_id), ...rest };
}

class PendingRegistrationRepository {
  async upsertByEmail(email, data) {
    const normalizedEmail = String(email || "").toLowerCase().trim();
    if (!normalizedEmail) return null;

    const doc = await PendingRegistration.findOneAndUpdate(
      { email: normalizedEmail },
      {
        ...data,
        email: normalizedEmail,
        updatedAt: new Date(),
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
    );

    return toPlain(doc);
  }

  async findByEmail(email) {
    const normalizedEmail = String(email || "").toLowerCase().trim();
    if (!normalizedEmail) return null;
    const doc = await PendingRegistration.findOne({ email: normalizedEmail });
    return toPlain(doc);
  }

  async deleteByEmail(email) {
    const normalizedEmail = String(email || "").toLowerCase().trim();
    if (!normalizedEmail) return null;
    const doc = await PendingRegistration.findOneAndDelete({
      email: normalizedEmail,
    });
    return toPlain(doc);
  }
}

export default new PendingRegistrationRepository();
