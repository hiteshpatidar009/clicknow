import dotenv from 'dotenv';
dotenv.config();
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

try {
  initializeApp({
    credential: cert(serviceAccount)
  });
  const db = getFirestore();
  db.collection('users').limit(1).get().then(res => {
     console.log("Firebase connection successful! Found docs:", res.size);
     process.exit(0);
  }).catch(e => {
     console.error("Firestore get error:", e);
     process.exit(1);
  });
} catch (e) {
  console.error("Firebase init error:", e);
  process.exit(1);
}
