import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    type: {
        type: String,
        enum: ['issue_assigned', 'issue_status', 'chat_message', 'team_message'],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    data: {
        type: Object,
        default: {}
    },
    read: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
