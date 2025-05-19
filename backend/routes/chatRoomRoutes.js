import express from 'express';
import * as chatRoomController from '../controllers/chatRoomController.js';
import { employeeAuth } from '../middleware/employeeAuthMiddleware.js';

const router = express.Router();

// All chat routes require employee authentication
router.use(employeeAuth);

// Chat room routes
router.route('/room')
    .post(chatRoomController.createChatRoom);

router.route('/room/:roomId')
    .get(chatRoomController.getChatRoom);

router.route('/room/:roomId/message')
    .post(chatRoomController.sendMessage);

router.route('/room/:roomId/read')
    .put(chatRoomController.markAsRead);

router.route('/room/:roomId/unread')
    .get(chatRoomController.getUnreadCount);

export default router;
