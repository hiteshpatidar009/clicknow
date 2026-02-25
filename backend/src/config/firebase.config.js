import env from "./env.loader.js";
import {
  normalizeFirebaseEnvValue,
  normalizeFirebasePrivateKey,
} from "../utils/firebase-credentials.util.js";

class FirebaseConfig {
  constructor() {
    this.serviceAccount = {
      type: "service_account",
      project_id: normalizeFirebaseEnvValue(env.FIREBASE_PROJECT_ID),
      private_key_id: normalizeFirebaseEnvValue(env.FIREBASE_PRIVATE_KEY_ID),
      private_key: normalizeFirebasePrivateKey(env.FIREBASE_PRIVATE_KEY),
      client_email: normalizeFirebaseEnvValue(env.FIREBASE_CLIENT_EMAIL),
      client_id: normalizeFirebaseEnvValue(env.FIREBASE_CLIENT_ID),
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: env.FIREBASE_CLIENT_CERT_URL,
    };

    this.databaseURL = `https://${env.FIREBASE_PROJECT_ID}.firebaseio.com`;
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

export default FirebaseConfig;
