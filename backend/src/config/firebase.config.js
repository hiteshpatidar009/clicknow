/**
 * Firebase Configuration
 * Configuration for Firebase Admin SDK
 */

import dotenv from "dotenv";
dotenv.config();

class FirebaseConfig {
  constructor() {
    this.serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri:
        process.env.FIREBASE_AUTH_URI ||
        "https://accounts.google.com/o/oauth2/auth",
      token_uri:
        process.env.FIREBASE_TOKEN_URI || "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url:
        process.env.FIREBASE_AUTH_PROVIDER_CERT_URL ||
        "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
    };

    this.databaseURL = `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`;
  }

  getServiceAccount() {
    return this.serviceAccount;
  }

  getDatabaseURL() {
    return this.databaseURL;
  }

  isConfigured() {
    return !!(
      this.serviceAccount.project_id &&
      this.serviceAccount.private_key &&
      this.serviceAccount.client_email
    );
  }
}

export default new FirebaseConfig();
