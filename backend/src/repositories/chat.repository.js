import BaseRepository from "./base.repository.js";
import { COLLECTIONS } from "../utils/constants.util.js";

class ChatRepository extends BaseRepository {
  constructor() {
    super(COLLECTIONS.CHATS);
  }

  /**
   * Find chat by participants
   * @param {string} userId1 - First user ID
   * @param {string} userId2 - Second user ID
   * @returns {Promise<Object|null>} Chat document
   */
  async findByParticipants(userId1, userId2) {
    const snapshot = await this.collection
      .where("participants", "array-contains", userId1)
      .get();

    for (const doc of snapshot.docs) {
      const chat = { id: doc.id, ...doc.data() };
      if (chat.participants.includes(userId2)) {
        return chat;
      }
    }

    return null;
  }

  /**
   * Find or create chat between two users
   * @param {string} userId1 - First user ID
   * @param {string} userId2 - Second user ID
   * @param {string} [bookingId] - Related booking ID
   * @returns {Promise<Object>} Chat document
   */
  async findOrCreate(userId1, userId2, bookingId = null) {
    let chat = await this.findByParticipants(userId1, userId2);

    if (!chat) {
      chat = await this.create({
        participants: [userId1, userId2],
        bookingId,
        lastMessage: null,
        lastMessageAt: null,
        unreadCount: {
          [userId1]: 0,
          [userId2]: 0,
        },
        isActive: true,
      });
    }

    return chat;
  }

  /**
   * Find chats for a user
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated chats
   */
  async findByUserId(userId, options = {}) {
    return this.findPaginated({
      ...options,
      where: [
        { field: "participants", operator: "array-contains", value: userId },
        { field: "isActive", operator: "==", value: true },
        { field: "isDeleted", operator: "==", value: false },
        ...(options.where || []),
      ],
      orderBy: "lastMessageAt",
      orderDirection: "desc",
    });
  }

  /**
   * Find chat by booking ID
   * @param {string} bookingId - Booking ID
   * @returns {Promise<Object|null>} Chat document
   */
  async findByBookingId(bookingId) {
    return this.findByField("bookingId", bookingId);
  }

  /**
   * Update last message
   * @param {string} chatId - Chat ID
   * @param {Object} message - Message data
   * @returns {Promise<Object>} Updated chat
   */
  async updateLastMessage(chatId, message) {
    const chat = await this.findById(chatId);

    if (!chat) {
      throw new Error("Chat not found");
    }

    const recipientId = chat.participants.find((p) => p !== message.senderId);
    const unreadCount = { ...chat.unreadCount };
    unreadCount[recipientId] = (unreadCount[recipientId] || 0) + 1;

    return this.update(chatId, {
      lastMessage: {
        text: message.text,
        senderId: message.senderId,
        type: message.type || "text",
      },
      lastMessageAt: this.db.timestamp(),
      unreadCount,
    });
  }

  /**
   * Mark messages as read
   * @param {string} chatId - Chat ID
   * @param {string} userId - User ID who read messages
   * @returns {Promise<Object>} Updated chat
   */
  async markAsRead(chatId, userId) {
    const chat = await this.findById(chatId);

    if (!chat) {
      throw new Error("Chat not found");
    }

    const unreadCount = { ...chat.unreadCount };
    unreadCount[userId] = 0;

    return this.update(chatId, { unreadCount });
  }

  /**
   * Get unread count for user
   * @param {string} userId - User ID
   * @returns {Promise<number>} Total unread messages
   */
  async getUnreadCount(userId) {
    const chats = await this.findAll({
      where: [
        { field: "participants", operator: "array-contains", value: userId },
        { field: "isActive", operator: "==", value: true },
        { field: "isDeleted", operator: "==", value: false },
      ],
    });

    let totalUnread = 0;
    for (const chat of chats) {
      totalUnread += chat.unreadCount?.[userId] || 0;
    }

    return totalUnread;
  }

  /**
   * Archive chat
   * @param {string} chatId - Chat ID
   * @returns {Promise<Object>} Updated chat
   */
  async archiveChat(chatId) {
    return this.update(chatId, { isActive: false });
  }

  /**
   * Unarchive chat
   * @param {string} chatId - Chat ID
   * @returns {Promise<Object>} Updated chat
   */
  async unarchiveChat(chatId) {
    return this.update(chatId, { isActive: true });
  }
}

class MessageRepository extends BaseRepository {
  constructor() {
    super(COLLECTIONS.MESSAGES);
  }

  /**
   * Get collection reference for a specific chat
   * @param {string} chatId - Chat ID
   * @returns {Object} Collection reference
   */
  getMessagesCollection(chatId) {
    return this.db
      .collection(COLLECTIONS.CHATS)
      .doc(chatId)
      .collection("messages");
  }

  /**
   * Create message in chat
   * @param {string} chatId - Chat ID
   * @param {Object} messageData - Message data
   * @returns {Promise<Object>} Created message
   */
  async createMessage(chatId, messageData) {
    const messageId = this.generateId();
    const timestamp = this.db.timestamp();

    const message = {
      id: messageId,
      ...messageData,
      createdAt: timestamp,
      updatedAt: timestamp,
      isRead: false,
      isDeleted: false,
    };

    await this.getMessagesCollection(chatId).doc(messageId).set(message);

    return { id: messageId, ...message };
  }

  /**
   * Get messages for a chat
   * @param {string} chatId - Chat ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated messages
   */
  async getMessages(chatId, options = {}) {
    const { limit = 50, cursor = null, orderDirection = "desc" } = options;

    let query = this.getMessagesCollection(chatId)
      .where("isDeleted", "==", false)
      .orderBy("createdAt", orderDirection);

    if (cursor) {
      const cursorDoc = await this.getMessagesCollection(chatId)
        .doc(cursor)
        .get();
      if (cursorDoc.exists) {
        query = query.startAfter(cursorDoc);
      }
    }

    query = query.limit(limit);

    const snapshot = await query.get();

    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const lastDoc = snapshot.docs[snapshot.docs.length - 1];
    const nextCursor = lastDoc ? lastDoc.id : null;

    return {
      data: messages,
      pagination: {
        limit,
        hasMore: messages.length === limit,
        nextCursor,
      },
    };
  }

  /**
   * Mark message as read
   * @param {string} chatId - Chat ID
   * @param {string} messageId - Message ID
   * @returns {Promise<Object>} Updated message
   */
  async markMessageAsRead(chatId, messageId) {
    await this.getMessagesCollection(chatId).doc(messageId).update({
      isRead: true,
      readAt: this.db.timestamp(),
    });

    const doc = await this.getMessagesCollection(chatId).doc(messageId).get();
    return { id: doc.id, ...doc.data() };
  }

  /**
   * Mark all messages as read for user
   * @param {string} chatId - Chat ID
   * @param {string} userId - User ID who read messages
   * @returns {Promise<boolean>} Success status
   */
  async markAllAsRead(chatId, userId) {
    const snapshot = await this.getMessagesCollection(chatId)
      .where("senderId", "!=", userId)
      .where("isRead", "==", false)
      .get();

    const batch = this.db.batch();

    snapshot.docs.forEach((doc) => {
      batch.update(doc.ref, {
        isRead: true,
        readAt: this.db.timestamp(),
      });
    });

    await batch.commit();
    return true;
  }

  /**
   * Delete message (soft delete)
   * @param {string} chatId - Chat ID
   * @param {string} messageId - Message ID
   * @returns {Promise<Object>} Updated message
   */
  async deleteMessage(chatId, messageId) {
    await this.getMessagesCollection(chatId).doc(messageId).update({
      isDeleted: true,
      deletedAt: this.db.timestamp(),
    });

    const doc = await this.getMessagesCollection(chatId).doc(messageId).get();
    return { id: doc.id, ...doc.data() };
  }
}

const chatRepository = new ChatRepository();
const messageRepository = new MessageRepository();

export { chatRepository, messageRepository };
export default chatRepository;
