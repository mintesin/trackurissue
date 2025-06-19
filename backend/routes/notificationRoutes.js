import express from 'express';
import { getUserNotifications, markNotificationRead } from '../controllers/notificationController.js';
import { employeeAuth } from '../middleware/employeeAuthMiddleware.js';

const router = express.Router();

// Get notifications for the logged-in user
router.get('/', employeeAuth, getUserNotifications);

// Mark a notification as read
router.patch('/:notificationId/read', employeeAuth, markNotificationRead);

export default router;
