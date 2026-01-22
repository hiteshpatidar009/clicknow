import {
  chatRepository,
  messageRepository,
  userRepository,
} from "../repositories/index.js";
import notificationService from "./notification.service.js";
import Logger from "../utils/logger.util.js";

class ChatService {
  /**
   * Get or create chat between two users
   */
  async getOrCreateChat(userId1, userId2, bookingId = null) {
    const chat = await chatRepository.findOrCreate(userId1, userId2, bookingId);
    return this.enrichChat(chat);
  }

  /**
   * Get chat by ID
   */
  async getById(chatId, userId) {
    const chat = await chatRepository.findById(chatId);

    if (!chat) {
      throw new Error("Chat not found");
    }

    if (!chat.participants.includes(userId)) {
      throw new Error("Unauthorized");
    }

    return this.enrichChat(chat);
  }

  /**
   * Get user's chats
   */
  async getUserChats(userId, options = {}) {
    const result = await chatRepository.findByUserId(userId, options);

    const enrichedChats = await Promise.all(
      result.data.map((chat) => this.enrichChat(chat, userId)),
    );

    return {
      data: enrichedChats,
      pagination: result.pagination,
    };
  }

  /**
   * Send message
   */
  async sendMessage(chatId, senderId, messageData) {
    const chat = await chatRepository.findById(chatId);

    if (!chat) {
      throw new Error("Chat not found");
    }

    if (!chat.participants.includes(senderId)) {
      throw new Error("Unauthorized");
    }

    const { text, type, attachments } = messageData;

    const message = await messageRepository.createMessage(chatId, {
      senderId,
      text,
      type: type || "text",
      attachments: attachments || [],
    });

    await chatRepository.updateLastMessage(chatId, {
      senderId,
      text,
      type: type || "text",
    });

    const recipientId = chat.participants.find((p) => p !== senderId);
    const sender = await userRepository.findById(senderId);

    await notificationService.sendNotification(recipientId, {
      type: "chat",
      title: sender?.displayName || "New Message",
      body: text?.substring(0, 100) || "Sent an attachment",
      data: {
        chatId,
        messageId: message.id,
        action: "new_message",
      },
      channels: ["push"],
    });

    Logger.logBusinessEvent("message_sent", { chatId, senderId });

    return message;
  }

  /**
   * Get messages for a chat
   */
  async getMessages(chatId, userId, options = {}) {
    const chat = await chatRepository.findById(chatId);

    if (!chat) {
      throw new Error("Chat not found");
    }

    if (!chat.participants.includes(userId)) {
      throw new Error("Unauthorized");
    }

    return messageRepository.getMessages(chatId, options);
  }

  /**
   * Mark messages as read
   */
  async markAsRead(chatId, userId) {
    const chat = await chatRepository.findById(chatId);

    if (!chat) {
      throw new Error("Chat not found");
    }

    if (!chat.participants.includes(userId)) {
      throw new Error("Unauthorized");
    }

    await messageRepository.markAllAsRead(chatId, userId);

    await chatRepository.markAsRead(chatId, userId);

    return true;
  }

  /**
   * Delete message
   */
  async deleteMessage(chatId, messageId, userId) {
    const chat = await chatRepository.findById(chatId);

    if (!chat) {
      throw new Error("Chat not found");
    }

    if (!chat.participants.includes(userId)) {
      throw new Error("Unauthorized");
    }

    const messages = await messageRepository.getMessages(chatId, { limit: 1 });
    const message = messages.data.find((m) => m.id === messageId);

    if (!message || message.senderId !== userId) {
      throw new Error("Cannot delete this message");
    }

    return messageRepository.deleteMessage(chatId, messageId);
  }

  /**
   * Get unread message count
   */
  async getUnreadCount(userId) {
    return chatRepository.getUnreadCount(userId);
  }

  /**
   * Archive chat
   */
  async archiveChat(chatId, userId) {
    const chat = await chatRepository.findById(chatId);

    if (!chat) {
      throw new Error("Chat not found");
    }

    if (!chat.participants.includes(userId)) {
      throw new Error("Unauthorized");
    }

    return chatRepository.archiveChat(chatId);
  }

  /**
   * Enrich chat with participant details
   */
  async enrichChat(chat, currentUserId = null) {
    const participantDetails = await Promise.all(
      chat.participants.map(async (participantId) => {
        const user = await userRepository.findById(participantId);
        return user ?
            {
              id: user.id,
              displayName: user.displayName,
              avatar: user.avatar,
            }
          : null;
      }),
    );

    const enriched = {
      ...chat,
      participantDetails: participantDetails.filter(Boolean),
    };

    if (currentUserId) {
      const otherParticipant = participantDetails.find(
        (p) => p?.id !== currentUserId,
      );
      enriched.otherParticipant = otherParticipant;
      enriched.unreadCount = chat.unreadCount?.[currentUserId] || 0;
    }

    return enriched;
  }
}

export default new ChatService();
