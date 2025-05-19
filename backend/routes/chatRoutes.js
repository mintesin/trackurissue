import express from 'express';
import * as chatRoomController from '../controllers/chatRoomController.js';
import { employeeAuth } from '../middleware/employeeAuthMiddleware.js';

const router = express.Router();

// All routes require employee authentication
router.use(employeeAuth);

// Chat room routes
router.post('/room', chatRoomController.createChatRoom);
router.get('/room/:roomId', chatRoomController.getChatRoom);
router.post('/room/:roomId/message', chatRoomController.sendMessage);
router.put('/room/:roomId/read', chatRoomController.markAsRead);
router.get('/room/:roomId/unread', chatRoomController.getUnreadCount);

export default router;
