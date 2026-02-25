import settingsRepository from "../repositories/settings.repository.js";
import SettingsModel from "../models/Settings.js";
import storageService from "./storage.service.js";

class SettingsService {
  async hydratePortfolioMediaUrls(settings) {
    if (!settings?.portfolioContent?.mediaGallery) {
      return settings;
    }

    const mediaGallery = Array.isArray(settings.portfolioContent.mediaGallery)
      ? settings.portfolioContent.mediaGallery
      : [];

    const hydratedGallery = await Promise.all(
      mediaGallery.map(async (item) => {
        const key =
          item?.key ||
          storageService.extractKeyFromUrl(item?.url) ||
          storageService.extractKeyFromUrl(item?.thumbnailUrl);

        if (!key) return item;

        try {
          const signed = await storageService.getSignedUrl(key);
          return {
            ...item,
            key,
            url: signed,
            thumbnailUrl: signed,
          };
        } catch {
          return { ...item, key };
        }
      }),
    );

    return {
      ...settings,
      portfolioContent: {
        ...settings.portfolioContent,
        mediaGallery: hydratedGallery,
      },
    };
  }

  async getSettings() {
    let settings = await settingsRepository.getSystemSettings();
    if (!settings) {
      // Create default
      const defaultSettings = new SettingsModel();
      settings = await settingsRepository.createSystemSettings(defaultSettings.toJSON());
    }
    return this.hydratePortfolioMediaUrls(settings);
  }

  async updateSettings(data) {
    // Check existence
    let settings = await settingsRepository.getSystemSettings();
    if (!settings) {
       await this.getSettings(); // Ensure it exists
    }
    const updated = await settingsRepository.updateSystemSettings(data);
    return this.hydratePortfolioMediaUrls(updated);
  }
}

export default new SettingsService();
