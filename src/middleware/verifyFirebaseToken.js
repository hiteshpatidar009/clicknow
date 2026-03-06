import admin from '../config/firebaseAdmin.js';
import User from '../models/User.js';

export const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Verify token with Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    req.firebaseUser = decodedToken;
    req.firebaseUid = decodedToken.uid;

    // Attach MongoDB user if exists, otherwise handling is up to the controller (e.g. for login/sync)
    // For protected routes, we usually expect the user to exist in Mongo.
    // We can fetch it here efficiently.
    const user = await User.findOne({ firebaseUid: decodedToken.uid });
    
    if (user) {
      req.user = user;
      req.userId = user._id;
    } else {
      // If user doesn't exist in Mongo, they might be new or not synced.
      // Some routes might allow this (like 'create profile'), others might fail.
      req.user = null;
    }

    next();
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};
