/**
 * Storage Service
 * AWS S3 file upload and management
 */

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import { awsConfig } from "../config/index.js";
import Logger from "../utils/logger.util.js";
import {
  FileTooLargeError,
  FileInvalidTypeError,
  FileUploadError,
} from "../utils/errors.util.js";

class StorageService {
  constructor() {
    this.client = new S3Client(awsConfig.getS3Config());
    this.bucketName = awsConfig.getBucketName();
  }

  /**
   * Upload file to S3
   */
  async uploadFile(file, options = {}) {
    const { folder = "uploads", userId = null } = options;

    // Validate file size
    if (file.size > awsConfig.getMaxFileSize()) {
      throw new FileTooLargeError(awsConfig.getMaxFileSize() / (1024 * 1024));
    }

    // Validate file type
    if (!awsConfig.getAllowedMimeTypes().includes(file.mimetype)) {
      throw new FileInvalidTypeError(awsConfig.getAllowedMimeTypes());
    }

    try {
      const fileExtension = file.originalname.split(".").pop();
      const fileName = `${folder}/${userId ? userId + "/" : ""}${uuidv4()}.${fileExtension}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
        Metadata: {
          originalName: file.originalname,
          uploadedBy: userId || "anonymous",
          uploadedAt: new Date().toISOString(),
        },
      });

      await this.client.send(command);

      const url = `https://${this.bucketName}.s3.${awsConfig.region}.amazonaws.com/${fileName}`;

      Logger.logExternalCall("S3", "upload_file", true);

      return {
        key: fileName,
        url,
        fileName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      };
    } catch (error) {
      Logger.error("S3 upload failed", error);
      Logger.logExternalCall("S3", "upload_file", false);
      throw new FileUploadError();
    }
  }

  /**
   * Upload multiple files
   */
  async uploadMultiple(files, options = {}) {
    const results = await Promise.all(
      files.map((file) => this.uploadFile(file, options)),
    );
    return results;
  }

  /**
   * Delete file from S3
   */
  async deleteFile(key) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.client.send(command);

      Logger.logExternalCall("S3", "delete_file", true);

      return true;
    } catch (error) {
      Logger.error("S3 delete failed", error);
      Logger.logExternalCall("S3", "delete_file", false);
      throw error;
    }
  }

  /**
   * Delete multiple files
   */
  async deleteMultiple(keys) {
    const results = await Promise.all(
      keys.map((key) => this.deleteFile(key).catch((e) => ({ error: e, key }))),
    );
    return results;
  }

  /**
   * Generate signed URL for private file access
   */
  async getSignedUrl(key, expiresIn = null) {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const url = await getSignedUrl(this.client, command, {
        expiresIn: expiresIn || awsConfig.getSignedUrlExpireSeconds(),
      });

      return url;
    } catch (error) {
      Logger.error("S3 signed URL generation failed", error);
      throw error;
    }
  }

  /**
   * Generate pre-signed URL for direct upload
   */
  async getUploadUrl(fileName, contentType, folder = "uploads") {
    try {
      const fileExtension = fileName.split(".").pop();
      const key = `${folder}/${uuidv4()}.${fileExtension}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ContentType: contentType,
      });

      const uploadUrl = await getSignedUrl(this.client, command, {
        expiresIn: 3600, // 1 hour
      });

      return {
        uploadUrl,
        key,
        fileUrl: `https://${this.bucketName}.s3.${awsConfig.region}.amazonaws.com/${key}`,
      };
    } catch (error) {
      Logger.error("S3 upload URL generation failed", error);
      throw error;
    }
  }

  /**
   * Get file URL
   */
  getFileUrl(key) {
    return `https://${this.bucketName}.s3.${awsConfig.region}.amazonaws.com/${key}`;
  }

  /**
   * Extract key from URL
   */
  extractKeyFromUrl(url) {
    const urlObj = new URL(url);
    return urlObj.pathname.substring(1); // Remove leading slash
  }
}

export default new StorageService();
