import Notification from '../models/notificationModel.js';

// Get notifications for a user (optionally filter unread)
export const getUserNotifications = async (req, res) => {
    try {
        const userId = req.user?._id || req.params.userId;
        if (!userId) {
            return res.status(400).json({ error: 'User ID required' });
        }
        const { unread } = req.query;
        const filter = { user: userId };
        if (unread === 'true') filter.read = false;
        const notifications = await Notification.find(filter).sort({ createdAt: -1 }).lean();
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ error: err.message || 'Failed to fetch notifications' });
    }
};

// Mark a notification as read
export const markNotificationRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const notification = await Notification.findByIdAndUpdate(
            notificationId,
            { read: true },
            { new: true }
        );
        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }
        res.json(notification);
    } catch (err) {
        res.status(500).json({ error: err.message || 'Failed to mark notification as read' });
    }
};
