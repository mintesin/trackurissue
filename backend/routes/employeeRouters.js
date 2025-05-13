import express from 'express';
import * as employeeControllers from '../controllers/employeeController.js';
import * as assignedIssueControllers from '../controllers/assignedIssueController.js';
import * as chatRoomControllers from '../controllers/chatRoomController.js';
import * as teamControllers from '../controllers/teamController.js';
import { employeeAuth, employeeLoginLimiter } from '../middleware/employeeAuthMiddleware.js';

const router = express.Router();

// Public routes (no authentication required)
router.post('/login', employeeLoginLimiter, employeeControllers.employeeLoginPost);
router.get('/login', employeeControllers.employeeLoginGet);
router.post('/reset', employeeControllers.resetAccountpost);
router.get('/reset', employeeControllers.resetAccountGet);

// Protected routes (authentication required)
router.use(employeeAuth); // Apply authentication middleware to all routes below

// Main route - shows team dashboard (employee's main view)
router.get('/', teamControllers.teamdashboard);

// Chat room routes
router.get('/chat/create', chatRoomControllers.createRoomGet);
router.post('/chat/create', chatRoomControllers.createRoomPost);
router.get('/chat/:roomId/delete', chatRoomControllers.deleteRoomGet);
router.post('/chat/:roomId/delete', chatRoomControllers.deleteRoomPost);
router.get('/chat/:roomId', chatRoomControllers.chatInTheroomGet);
router.post('/chat/:roomId', chatRoomControllers.chatInTheroomPost);

// Issue routes
router.get('/assigned-issues', assignedIssueControllers.assignedIssueList);
router.get('/assigned-issues/:id/solve', assignedIssueControllers.assignedIssueSolveGet);
router.post('/assigned-issues/:id/solve', assignedIssueControllers.assignedIssueSolvePost);

// Team related routes
router.get('/team/:teamId', teamControllers.teamdashboard);
router.get('/team/:teamId/add-member', teamControllers.addMemeberGet);
router.post('/team/:teamId/add-member', teamControllers.addMemeberPost);
router.get('/team/:teamId/remove-member', teamControllers.removeMemeberGet);
router.post('/team/:teamId/remove-member', teamControllers.removeMemeberPost);

// Profile routes
router.get('/profile/:id', employeeControllers.getEmployeeProfile);
router.put('/profile/:id', employeeControllers.updateEmployeeProfile);

export default router;
