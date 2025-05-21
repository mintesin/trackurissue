const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    sender: {
        type: String,
        required: true
    },
    room: {
        type: String,
        required: true,
        default: 'general'
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Add indexes for better query performance
messageSchema.index({ room: 1, timestamp: -1 });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
