import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
        trim: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const readStatusSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    lastRead: {
        type: Date,
        default: Date.now
    }
});

const chatRoomSchema = new mongoose.Schema({
    team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: true
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee'
    }],
    messages: [messageSchema],
    readStatus: [readStatusSchema],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
chatRoomSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Add indexes for better query performance
chatRoomSchema.index({ team: 1 });
chatRoomSchema.index({ participants: 1 });
chatRoomSchema.index({ updatedAt: -1 });

// Add virtual for unread messages count
chatRoomSchema.virtual('unreadCount').get(function() {
    return this.messages.length - this.readStatus.length;
});

// Ensure virtuals are included when converting to JSON
chatRoomSchema.set('toJSON', { virtuals: true });
chatRoomSchema.set('toObject', { virtuals: true });

const ChatRoom = mongoose.model('ChatRoom', chatRoomSchema);

export default ChatRoom;
