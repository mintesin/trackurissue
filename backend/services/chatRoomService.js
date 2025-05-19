import ChatRoom from '../models/chatRoomModel.js';
import * as genericError from './genericError.js';
import webSocketService from './webSocketService.js';

/**
 * Create a new chat room for a team
 * @param {string} teamId - Team ID
 * @param {Array} participants - Array of participant IDs
 * @returns {Promise<Object>} Created chat room
 */
export const createChatRoom = async (teamId, participants) => {
    try {
        const existingRoom = await ChatRoom.findOne({ team: teamId });
        if (existingRoom) {
            return existingRoom;
        }

        const chatRoom = await ChatRoom.create({
            team: teamId,
            participants,
            messages: [],
            readStatus: participants.map(userId => ({
                user: userId,
                lastRead: new Date()
            }))
        });

        return chatRoom;
    } catch (error) {
        console.error('Error in createChatRoom:', error);
        throw error;
    }
};

/**
 * Get chat room by ID with messages
 * @param {string} roomId - Chat room ID
 * @param {number} page - Page number for pagination
 * @param {number} limit - Number of messages per page
 * @returns {Promise<Object>} Chat room with messages
 */
export const getChatRoom = async (roomId, page = 1, limit = 50) => {
    try {
        const chatRoom = await ChatRoom.findById(roomId)
            .populate('messages.sender', 'firstName lastName')
            .populate('participants', 'firstName lastName')
            .select('-__v')
            .lean();

        if (!chatRoom) {
            throw new genericError.NotFoundError('Chat room not found');
        }

        // Paginate messages
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const paginatedMessages = chatRoom.messages.slice(startIndex, endIndex);

        return {
            ...chatRoom,
            messages: paginatedMessages,
            hasMore: endIndex < chatRoom.messages.length
        };
    } catch (error) {
        console.error('Error in getChatRoom:', error);
        throw error;
    }
};

/**
 * Send a new message in a chat room
 * @param {string} roomId - Chat room ID
 * @param {string} senderId - Sender's ID
 * @param {string} content - Message content
 * @returns {Promise<Object>} New message
 */
export const sendMessage = async (roomId, senderId, content) => {
    try {
        const chatRoom = await ChatRoom.findById(roomId);
        if (!chatRoom) {
            throw new genericError.NotFoundError('Chat room not found');
        }

        const message = {
            content: content.trim(),
            sender: senderId,
            timestamp: new Date()
        };

        chatRoom.messages.push(message);
        await chatRoom.save();

        // Populate sender info for the response
        const populatedMessage = await ChatRoom.populate(message, {
            path: 'sender',
            select: 'firstName lastName'
        });

        // Broadcast message via WebSocket
        webSocketService.broadcastToRoom(roomId, {
            type: 'message',
            roomId,
            message: populatedMessage
        });

        return populatedMessage;
    } catch (error) {
        console.error('Error in sendMessage:', error);
        throw error;
    }
};

/**
 * Mark messages as read for a user
 * @param {string} roomId - Chat room ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Updated chat room
 */
export const markAsRead = async (roomId, userId) => {
    try {
        const chatRoom = await ChatRoom.findById(roomId);
        if (!chatRoom) {
            throw new genericError.NotFoundError('Chat room not found');
        }

        // Update last read timestamp for the user
        const readStatus = chatRoom.readStatus.find(
            status => status.user.toString() === userId.toString()
        );

        if (readStatus) {
            readStatus.lastRead = new Date();
        } else {
            chatRoom.readStatus.push({
                user: userId,
                lastRead: new Date()
            });
        }

        await chatRoom.save();
        return chatRoom;
    } catch (error) {
        console.error('Error in markAsRead:', error);
        throw error;
    }
};

/**
 * Get unread message count for a user
 * @param {string} roomId - Chat room ID
 * @param {string} userId - User ID
 * @returns {Promise<number>} Number of unread messages
 */
export const getUnreadCount = async (roomId, userId) => {
    try {
        const chatRoom = await ChatRoom.findById(roomId);
        if (!chatRoom) {
            throw new genericError.NotFoundError('Chat room not found');
        }

        // Get user's last read timestamp
        const readStatus = chatRoom.readStatus.find(
            status => status.user.toString() === userId.toString()
        );

        const lastRead = readStatus ? readStatus.lastRead : new Date(0);

        // Count messages after last read
        const unreadCount = chatRoom.messages.filter(
            msg => msg.timestamp > lastRead && msg.sender.toString() !== userId.toString()
        ).length;

        return { unreadCount };
    } catch (error) {
        console.error('Error in getUnreadCount:', error);
        throw error;
    }
};

export default {
    createChatRoom,
    getChatRoom,
    sendMessage,
    markAsRead,
    getUnreadCount
};
