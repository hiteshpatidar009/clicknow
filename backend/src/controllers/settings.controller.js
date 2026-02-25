import settingsService from "../services/settings.service.js";
import ApiResponse from "../utils/response.util.js";
import { asyncHandler } from "../middlewares/error.middleware.js";

class SettingsController {
  getSettings = asyncHandler(async (req, res) => {
    const settings = await settingsService.getSettings();
    return ApiResponse.success(res, settings);
  });

  updateSettings = asyncHandler(async (req, res) => {
    const settings = await settingsService.updateSettings(req.body);
    return ApiResponse.success(res, settings, "Settings updated");
  });
}

export default new SettingsController();
