import OtpCode from "../models/OtpCode.js";

function toPlain(doc) {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : doc;
  const { _id, __v, ...rest } = obj;
  return { id: String(_id), ...rest };
}

class OtpRepository {
  async upsertByPhone(phone, data) {
    const normalizedPhone = String(phone || "").trim();
    if (!normalizedPhone) return null;
    const doc = await OtpCode.findOneAndUpdate(
      { phone: normalizedPhone },
      { ...data, phone: normalizedPhone, updatedAt: new Date() },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
    );
    return toPlain(doc);
  }

  async findByPhone(phone) {
    const normalizedPhone = String(phone || "").trim();
    if (!normalizedPhone) return null;
    const doc = await OtpCode.findOne({ phone: normalizedPhone });
    return toPlain(doc);
  }

  async deleteByPhone(phone) {
    const normalizedPhone = String(phone || "").trim();
    if (!normalizedPhone) return null;
    const doc = await OtpCode.findOneAndDelete({ phone: normalizedPhone });
    return toPlain(doc);
  }
}

export default new OtpRepository();
