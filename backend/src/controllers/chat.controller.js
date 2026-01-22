import { chatService } from "../services/index.js";
import ApiResponse from "../utils/response.util.js";
import { asyncHandler } from "../middlewares/error.middleware.js";

class ChatController {
  /**
   * GET /api/v1/chats
   */
  getChats = asyncHandler(async (req, res) => {
    const { page, pageSize } = req.query;
    const result = await chatService.getUserChats(req.user.userId, {
      page: parseInt(page) || 1,
      pageSize: parseInt(pageSize) || 20,
    });
    return ApiResponse.paginated(res, result.data, result.pagination);
  });

  /**
   * GET /api/v1/chats/:id
   */
  getById = asyncHandler(async (req, res) => {
    const chat = await chatService.getById(req.params.id, req.user.userId);
    return ApiResponse.success(res, chat);
  });

  /**
   * POST /api/v1/chats
   */
  createChat = asyncHandler(async (req, res) => {
    const { recipientId, bookingId } = req.body;
    const chat = await chatService.getOrCreateChat(
      req.user.userId,
      recipientId,
      bookingId,
    );
    return ApiResponse.success(res, chat);
  });

  /**
   * GET /api/v1/chats/:id/messages
   */
  getMessages = asyncHandler(async (req, res) => {
    const { page, pageSize, before } = req.query;
    const result = await chatService.getMessages(
      req.params.id,
      req.user.userId,
      {
        page: parseInt(page) || 1,
        pageSize: parseInt(pageSize) || 50,
        before,
      },
    );
    return ApiResponse.paginated(res, result.data, result.pagination);
  });

  /**
   * POST /api/v1/chats/:id/messages
   */
  sendMessage = asyncHandler(async (req, res) => {
    const message = await chatService.sendMessage(
      req.params.id,
      req.user.userId,
      req.body,
    );
    return ApiResponse.created(res, message, "Message sent");
  });

  /**
   * PUT /api/v1/chats/:id/read
   */
  markAsRead = asyncHandler(async (req, res) => {
    await chatService.markAsRead(req.params.id, req.user.userId);
    return ApiResponse.success(res, null, "Marked as read");
  });

  /**
   * DELETE /api/v1/chats/:chatId/messages/:messageId
   */
  deleteMessage = asyncHandler(async (req, res) => {
    await chatService.deleteMessage(
      req.params.chatId,
      req.params.messageId,
      req.user.userId,
    );
    return ApiResponse.success(res, null, "Message deleted");
  });

  /**
   * GET /api/v1/chats/unread-count
   */
  getUnreadCount = asyncHandler(async (req, res) => {
    const count = await chatService.getUnreadCount(req.user.userId);
    return ApiResponse.success(res, { unreadCount: count });
  });

  /**
   * PUT /api/v1/chats/:id/archive
   */
  archiveChat = asyncHandler(async (req, res) => {
    await chatService.archiveChat(req.params.id, req.user.userId);
    return ApiResponse.success(res, null, "Chat archived");
  });
}

export default ChatController;
