/**
 * Chat Routes
 * /api/v1/chats
 */

import { Router } from "express";
import { chatController } from "../controllers/index.js";
import { authenticate, messagingLimiter } from "../middlewares/index.js";
import { validate } from "../middlewares/validation.middleware.js";
import {
  createChatSchema,
  sendMessageSchema,
  getMessagesSchema,
  getChatsSchema,
  chatIdParamSchema,
  messageIdParamSchema,
} from "../validators/chat.validator.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get("/", validate(getChatsSchema), chatController.getChats);
router.post("/", validate(createChatSchema), chatController.createChat);
router.get("/unread-count", chatController.getUnreadCount);
router.get("/:id", validate(chatIdParamSchema), chatController.getById);
router.get(
  "/:id/messages",
  validate({ ...chatIdParamSchema, ...getMessagesSchema }),
  chatController.getMessages,
);
router.post(
  "/:id/messages",
  messagingLimiter,
  validate({ ...chatIdParamSchema, ...sendMessageSchema }),
  chatController.sendMessage,
);
router.put("/:id/read", validate(chatIdParamSchema), chatController.markAsRead);
router.put(
  "/:id/archive",
  validate(chatIdParamSchema),
  chatController.archiveChat,
);
router.delete(
  "/:chatId/messages/:messageId",
  validate(messageIdParamSchema),
  chatController.deleteMessage,
);

export default router;
