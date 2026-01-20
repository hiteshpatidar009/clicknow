/**
 * Firebase Database Connection
 * Singleton class for Firebase Admin SDK initialization
 */

import admin from "firebase-admin";
import { firebaseConfig } from "../config/index.js";
import Logger from "../utils/logger.util.js";

class FirebaseDatabase {
  constructor() {
    this.db = null;
    this.auth = null;
    this.initialized = false;
  }

  /**
   * Initialize Firebase Admin SDK
   */
  initialize() {
    if (this.initialized) {
      Logger.warn("Firebase already initialized");
      return;
    }

    try {
      if (!firebaseConfig.isConfigured()) {
        throw new Error(
          "Firebase configuration is incomplete. Check environment variables.",
        );
      }

      admin.initializeApp({
        credential: admin.credential.cert(firebaseConfig.getServiceAccount()),
        databaseURL: firebaseConfig.getDatabaseURL(),
      });

      this.db = admin.firestore();
      this.auth = admin.auth();
      this.initialized = true;

      // Firestore settings for better performance
      this.db.settings({
        ignoreUndefinedProperties: true,
      });

      Logger.info("Firebase initialized successfully");
    } catch (error) {
      Logger.error("Firebase initialization failed:", error);
      throw error;
    }
  }

  /**
   * Get Firestore instance
   */
  getFirestore() {
    if (!this.initialized) {
      this.initialize();
    }
    return this.db;
  }

  /**
   * Get Firebase Auth instance
   */
  getAuth() {
    if (!this.initialized) {
      this.initialize();
    }
    return this.auth;
  }

  /**
   * Get Firebase Admin instance
   */
  getAdmin() {
    return admin;
  }

  /**
   * Create a Firestore timestamp
   */
  timestamp() {
    return admin.firestore.FieldValue.serverTimestamp();
  }

  /**
   * Create a Firestore array union
   */
  arrayUnion(...elements) {
    return admin.firestore.FieldValue.arrayUnion(...elements);
  }

  /**
   * Create a Firestore array remove
   */
  arrayRemove(...elements) {
    return admin.firestore.FieldValue.arrayRemove(...elements);
  }

  /**
   * Create a Firestore increment
   */
  increment(n) {
    return admin.firestore.FieldValue.increment(n);
  }

  /**
   * Create a Firestore delete field
   */
  deleteField() {
    return admin.firestore.FieldValue.delete();
  }

  /**
   * Create a GeoPoint
   */
  geoPoint(latitude, longitude) {
    return new admin.firestore.GeoPoint(latitude, longitude);
  }

  /**
   * Run a transaction
   */
  async runTransaction(callback) {
    return this.db.runTransaction(callback);
  }

  /**
   * Create a batch write
   */
  batch() {
    return this.db.batch();
  }

  /**
   * Get collection reference
   */
  collection(name) {
    return this.db.collection(name);
  }

  /**
   * Get document reference
   */
  doc(path) {
    return this.db.doc(path);
  }
}

// Singleton instance
const firebaseDatabase = new FirebaseDatabase();

export default firebaseDatabase;
export { admin };
