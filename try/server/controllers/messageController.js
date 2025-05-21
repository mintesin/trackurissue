const Message = require('../models/Message');

const messageController = {
    // Get messages for a specific room
    getMessages: async (req, res) => {
        try {
            const { room } = req.query;
            const messages = await Message.find({ room })
                .sort({ timestamp: -1 })
                .limit(50);
            res.json(messages.reverse());
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // Save a new message
    saveMessage: async (message) => {
        try {
            const newMessage = new Message(message);
            await newMessage.save();
            return newMessage;
        } catch (error) {
            console.error('Error saving message:', error);
            throw error;
        }
    },

    // Get recent messages for a room
    getRecentMessages: async (room) => {
        try {
            return await Message.find({ room })
                .sort({ timestamp: -1 })
                .limit(50);
        } catch (error) {
            console.error('Error getting recent messages:', error);
            throw error;
        }
    }
};

module.exports = messageController;
