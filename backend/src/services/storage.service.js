/**
 * Storage Service
 */

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl as getAwsSignedUrl } from "@aws-sdk/s3-request-presigner";
import { awsConfig } from "../config/index.js";
import Logger from "../utils/logger.util.js";

class StorageService {
  constructor() {
    this.bucketName = awsConfig.getBucketName();
    this.region = awsConfig.region;
    this.maxFileSize = awsConfig.getMaxFileSize();
    this.allowedMimeTypes = awsConfig.getAllowedMimeTypes();
    this.signedUrlExpireSeconds = awsConfig.getSignedUrlExpireSeconds();
    this.s3Client = awsConfig.isConfigured()
      ? new S3Client(awsConfig.getS3Config())
      : null;
  }

  ensureConfigured() {
    if (!this.s3Client || !this.bucketName) {
      throw new Error(
        "AWS S3 is not configured. Set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION and AWS_S3_BUCKET_NAME.",
      );
    }
  }

  sanitizeFilename(filename = "file") {
    return filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  }

  objectUrl(key) {
    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
  }

  extractKeyFromUrl(url = "") {
    if (!url || typeof url !== "string") return "";
    try {
      const parsed = new URL(url);
      const host = (parsed.hostname || "").toLowerCase();
      const bucket = (this.bucketName || "").toLowerCase();
      const isS3Host =
        host === `${bucket}.s3.${this.region}.amazonaws.com` ||
        host === `${bucket}.s3.amazonaws.com` ||
        host.endsWith(".amazonaws.com");

      if (!isS3Host) return "";
      return decodeURIComponent(parsed.pathname.replace(/^\/+/, ""));
    } catch {
      return "";
    }
  }

  async uploadFile(file, options = {}) {
    this.ensureConfigured();
    const { folder = "general", userId } = options;
    if (!file?.buffer) {
      throw new Error("Invalid file payload");
    }
    if (file.size > this.maxFileSize) {
      throw new Error("File exceeds maximum allowed size");
    }
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new Error(`Unsupported file type: ${file.mimetype}`);
    }

    const safeName = this.sanitizeFilename(file.originalname || "file");
    const owner = userId || "anonymous";
    const key = `${folder}/${owner}/${Date.now()}-${safeName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });
    await this.s3Client.send(command);

    const publicUrl = this.objectUrl(key);
    const url = await this.getSignedUrl(key, this.signedUrlExpireSeconds);

    Logger.info("File uploaded", { key, userId });

    return {
      key,
      url,
      publicUrl,
      filename: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  async uploadMultiple(files, options = {}) {
    const results = await Promise.all(
      files.map((file) => this.uploadFile(file, options)),
    );
    return results;
  }

  async deleteFile(key) {
    this.ensureConfigured();
    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      }),
    );
    Logger.info("File deleted", { key });
    return true;
  }

  async getUploadUrl(fileName, contentType, folder = "general") {
    this.ensureConfigured();
    if (!this.allowedMimeTypes.includes(contentType)) {
      throw new Error(`Unsupported file type: ${contentType}`);
    }

    const safeName = this.sanitizeFilename(fileName || "file");
    const key = `${folder}/${Date.now()}-${safeName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
    });
    const expiresIn = this.signedUrlExpireSeconds;
    const uploadUrl = await getAwsSignedUrl(this.s3Client, command, {
      expiresIn,
    });

    return {
      uploadUrl,
      key,
      expiresIn,
    };
  }

  async getSignedUrl(key, expiresIn = this.signedUrlExpireSeconds) {
    this.ensureConfigured();
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });
    const url = await getAwsSignedUrl(this.s3Client, command, {
      expiresIn,
    });
    return url;
  }
}

export default new StorageService();
