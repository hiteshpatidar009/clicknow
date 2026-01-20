/**
 * AWS Configuration
 * Configuration for AWS S3 storage
 */

import dotenv from "dotenv";
dotenv.config();

class AWSConfig {
  constructor() {
    this.region = process.env.AWS_REGION || "us-east-1";
    this.credentials = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    };
    this.s3 = {
      bucketName: process.env.AWS_S3_BUCKET_NAME || "photography-app-bucket",
      signedUrlExpireSeconds: 3600,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedMimeTypes: [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "video/mp4",
        "video/quicktime",
        "video/x-msvideo",
      ],
    };
  }

  getS3Config() {
    return {
      region: this.region,
      credentials: this.credentials,
    };
  }

  getBucketName() {
    return this.s3.bucketName;
  }

  getSignedUrlExpireSeconds() {
    return this.s3.signedUrlExpireSeconds;
  }

  getAllowedMimeTypes() {
    return this.s3.allowedMimeTypes;
  }

  getMaxFileSize() {
    return this.s3.maxFileSize;
  }

  isConfigured() {
    return !!(
      this.credentials.accessKeyId &&
      this.credentials.secretAccessKey &&
      this.s3.bucketName
    );
  }
}

export default new AWSConfig();
