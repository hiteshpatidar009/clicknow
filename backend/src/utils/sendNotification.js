import admin from '../config/firebaseAdmin.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

/**
 * Send request to Firebase Cloud Messaging
 * @param {string|string[]} tokens - FCM registration token(s)
 * @param {object} message - Notification payload
 */
export const sendFCMNotification = async (tokens, message) => {
  if (!tokens || (Array.isArray(tokens) && tokens.length === 0)) {
    return;
  }

  const payload = {
    notification: {
      title: message.title,
      body: message.body,
      imageUrl: message.imageUrl,
    },
    data: {
      ...message.data, // Custom key-value pairs
      click_action: 'FLUTTER_NOTIFICATION_CLICK', // or suitable action
    },
    // tokens: Array.isArray(tokens) ? tokens : [tokens] // Multicast not supported in all basic payloads, verify method
  };

  try {
    // If single token
    if (typeof tokens === 'string') {
      await admin.messaging().send({
        token: tokens,
        ...payload
      });
    } else if (Array.isArray(tokens)) {
        // Multicast
      await admin.messaging().sendEachForMulticast({
        tokens,
        ...payload
      });
    }
  } catch (error) {
    console.error('Error sending FCM notification:', error);
  }
};

/**
 * Send notification to a user and save to DB
 * @param {string} userId - Target User ID (Mongo ObjectId)
 * @param {object} notificationData - { title, body, data, type, imageUrl, actionUrl }
 */
export const sendNotificationToUser = async (userId, notificationData) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    // Save to MongoDB
    const notification = await Notification.create({
      userId,
      ...notificationData,
      isSent: false
    });

    // Send FCM if user has token and settings allow
    if (user.fcmToken && user.settings?.notifications?.push) {
       await sendFCMNotification(user.fcmToken, notificationData);
       
       // Update sent status
       notification.isSent = true;
       notification.sentVia = { ...notification.sentVia, push: new Date() };
       await notification.save();
    }

    return notification;
  } catch (error) {
    console.error('Error in sendNotificationToUser:', error);
    throw error;
  }
};
