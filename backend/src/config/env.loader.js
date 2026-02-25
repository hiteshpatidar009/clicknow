import dotenv from "dotenv";
import env from "./environment.js";
import {
  normalizeFirebaseEnvValue,
  normalizeFirebasePrivateKey,
} from "../utils/firebase-credentials.util.js";

dotenv.config();

const requiredEnvVars = ["JWT_SECRET", "JWT_REFRESH_SECRET"];
const missingVars = [];

function loadEnv() {
  env.NODE_ENV = process.env.NODE_ENV || "development";
  env.PORT = parseInt(process.env.PORT, 10) || 3000;
  env.API_VERSION = process.env.API_VERSION || "v1";

  env.FIREBASE_PROJECT_ID = normalizeFirebaseEnvValue(
    process.env.FIREBASE_PROJECT_ID || "",
  );
  env.FIREBASE_PRIVATE_KEY_ID = normalizeFirebaseEnvValue(
    process.env.FIREBASE_PRIVATE_KEY_ID || "",
  );
  env.FIREBASE_PRIVATE_KEY = normalizeFirebasePrivateKey(
    process.env.FIREBASE_PRIVATE_KEY || "",
  );
  env.FIREBASE_CLIENT_EMAIL = normalizeFirebaseEnvValue(
    process.env.FIREBASE_CLIENT_EMAIL || "",
  );
  env.FIREBASE_CLIENT_ID = normalizeFirebaseEnvValue(
    process.env.FIREBASE_CLIENT_ID || "",
  );
  env.FIREBASE_WEB_API_KEY = normalizeFirebaseEnvValue(
    process.env.FIREBASE_WEB_API_KEY || "",
  );

  env.AWS_ACCESS_KEY_ID =
    process.env.AWS_ACCESS_KEY_ID ||
    process.env.AWS_ACCESS_KEY ||
    process.env.Access_key_ID ||
    "";
  env.AWS_SECRET_ACCESS_KEY =
    process.env.AWS_SECRET_ACCESS_KEY ||
    process.env.AWS_SECRET_KEY ||
    process.env.Secret_access_key ||
    "";
  env.AWS_REGION =
    process.env.AWS_REGION ||
    process.env.AWS_DEFAULT_REGION ||
    "us-east-1";
  env.AWS_S3_BUCKET_NAME =
    process.env.AWS_S3_BUCKET_NAME ||
    process.env.AWS_BUCKET_NAME ||
    process.env.S3_BUCKET_NAME ||
    "";

  env.JWT_SECRET = process.env.JWT_SECRET || "";
  env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
  env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "";
  env.JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "30d";

  env.WHATSAPP_API_URL =
    process.env.WHATSAPP_API_URL || "https://graph.facebook.com/v17.0";
  env.WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || "";
  env.WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || "";

  env.RATE_LIMIT_WINDOW_MS =
    parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000;
  env.RATE_LIMIT_MAX_REQUESTS =
    parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100;

  env.LOG_LEVEL = process.env.LOG_LEVEL || "info";
  env.LOG_FORMAT = process.env.LOG_FORMAT || "combined";

  env.CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

  env.OTP_PROVIDER_EMAIL = (process.env.OTP_PROVIDER_EMAIL || "mock")
    .toLowerCase()
    .trim();
  env.OTP_PROVIDER_PHONE = (process.env.OTP_PROVIDER_PHONE || "mock")
    .toLowerCase()
    .trim();
  env.OTP_EXPIRY_MINUTES =
    parseInt(process.env.OTP_EXPIRY_MINUTES, 10) || 10;
  env.OTP_ALLOW_MOCK_FALLBACK = (
    process.env.OTP_ALLOW_MOCK_FALLBACK || "true"
  )
    .toLowerCase()
    .trim();

  env.SMTP_HOST = process.env.SMTP_HOST || "";
  env.SMTP_PORT = parseInt(process.env.SMTP_PORT, 10) || 587;
  env.SMTP_SECURE = (process.env.SMTP_SECURE || "false").toLowerCase().trim();
  env.SMTP_USER = process.env.SMTP_USER || "";
  env.SMTP_PASS = process.env.SMTP_PASS || "";
  env.SMTP_FROM = process.env.SMTP_FROM || "";

  env.DEFAULT_PAGE_SIZE = parseInt(process.env.DEFAULT_PAGE_SIZE, 10) || 20;
  env.MAX_PAGE_SIZE = parseInt(process.env.MAX_PAGE_SIZE, 10) || 100;

  requiredEnvVars.forEach((varName) => {
    if (!env[varName]) {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    console.error(
      "\x1b[31m%s\x1b[0m",
      "❌ ERROR: Missing required environment variables:",
    );
    missingVars.forEach((v) => console.error("\x1b[31m%s\x1b[0m", `   - ${v}`));
    console.error("\x1b[33m%s\x1b[0m", "\n⚠️  Please check your .env file\n");
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}`,
    );
  }

  console.log(
    "\x1b[32m%s\x1b[0m",
    "✓ Environment variables loaded successfully",
  );
  return env;
}

loadEnv();

export default env;
