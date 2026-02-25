import admin from 'firebase-admin';
import dotenv from 'dotenv';
import {
  normalizeFirebaseEnvValue,
  normalizeFirebasePrivateKey,
} from '../utils/firebase-credentials.util.js';

dotenv.config();

// Ensure formatting of private key
const privateKey = normalizeFirebasePrivateKey(process.env.FIREBASE_PRIVATE_KEY || '');

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: normalizeFirebaseEnvValue(process.env.FIREBASE_PROJECT_ID || ''),
        clientEmail: normalizeFirebaseEnvValue(process.env.FIREBASE_CLIENT_EMAIL || ''),
        privateKey: privateKey,
      }),
    });
    console.log('Firebase Admin Initialized');
  } catch (error) {
    console.error('Firebase Admin Initialization Error:', error);
  }
}

export default admin;
