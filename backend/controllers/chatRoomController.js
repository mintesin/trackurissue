import expressAsyncHandler from 'express-async-handler';
import * as chatRoomService from '../services/chatRoomService.js';

const asyncHandler = expressAsyncHandler;

/**
 * GET /chat/room/:roomId
 * Get chat room with messages
 */
export const getChatRoom = asyncHandler(async (req, res) => {
    const { roomId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const chatRoom = await chatRoomService.getChatRoom(roomId, parseInt(page), parseInt(limit));
    res.json(chatRoom);
});

/**
 * POST /chat/room
 * Create a new chat room
 */
export const createChatRoom = asyncHandler(async (req, res) => {
    const { teamId, participants } = req.body;

    if (!teamId || !participants?.length) {
        return res.status(400).json({ message: 'Team ID and participants are required' });
    }

    const chatRoom = await chatRoomService.createChatRoom(teamId, participants);
    res.status(201).json(chatRoom);
});

/**
 * POST /chat/room/:roomId/message
 * Send a message in a chat room
 */
export const sendMessage = asyncHandler(async (req, res) => {
    const { roomId } = req.params;
    const { content } = req.body;

    if (!content?.trim()) {
        return res.status(400).json({ message: 'Message content is required' });
    }

    const message = await chatRoomService.sendMessage(roomId, req.employee._id, content);
    res.status(201).json(message);
});

/**
 * PUT /chat/room/:roomId/read
 * Mark messages as read
 */
export const markAsRead = asyncHandler(async (req, res) => {
    const { roomId } = req.params;
    const chatRoom = await chatRoomService.markAsRead(roomId, req.employee._id);
    res.json({ message: 'Messages marked as read' });
});

/**
 * GET /chat/room/:roomId/unread
 * Get unread message count
 */
export const getUnreadCount = asyncHandler(async (req, res) => {
    const { roomId } = req.params;
    const result = await chatRoomService.getUnreadCount(roomId, req.employee._id);
    res.json(result);
});

export default {
    getChatRoom,
    createChatRoom,
    sendMessage,
    markAsRead,
    getUnreadCount
};
