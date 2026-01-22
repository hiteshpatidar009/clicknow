/**
 * Storage Service
 */

import { awsConfig } from "../config/index.js";
import Logger from "../utils/logger.util.js";

class StorageService {
  async uploadFile(file, options = {}) {
    const { folder = "general", userId } = options;

    const key = `${folder}/${userId}/${Date.now()}-${file.originalname}`;
    const url = `https://storage.example.com/${key}`;

    Logger.info("File uploaded", { key, userId });

    return {
      key,
      url,
      filename: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  async uploadMultiple(files, options = {}) {
    const results = await Promise.all(
      files.map((file) => this.uploadFile(file, options))
    );
    return results;
  }

  async deleteFile(key) {
    Logger.info("File deleted", { key });
    return true;
  }

  async getUploadUrl(fileName, contentType, folder = "general") {
    const key = `${folder}/${Date.now()}-${fileName}`;
    const uploadUrl = `https://storage.example.com/upload/${key}`;

    return {
      uploadUrl,
      key,
      expiresIn: 3600,
    };
  }

  async getSignedUrl(key, expiresIn = 3600) {
    const url = `https://storage.example.com/${key}?expires=${expiresIn}`;
    return url;
  }
}

export default new StorageService();
