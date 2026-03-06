import Settings from "../models/Settings.js";

class SettingsRepository {
  async getSystemSettings() {
    return Settings.findOne().lean();
  }

  async createSystemSettings(data) {
    const settings = await Settings.create(data);
    return settings.toObject();
  }

  async updateSystemSettings(data) {
    return Settings.findOneAndUpdate(
      {},
      { $set: data },
      { returnDocument: "after", upsert: true },
    ).lean();
  }
}

export default new SettingsRepository();
