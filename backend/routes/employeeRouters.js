import express from 'express';
import * as employeeControllers from '../controllers/employeeController.js';
import * as assignedIssueControllers from '../controllers/assignedIssueController.js';
import * as teamControllers from '../controllers/teamController.js';
import { employeeAuth, employeeLoginLimiter } from '../middleware/employeeAuthMiddleware.js';

const router = express.Router();

// Public routes (no authentication required)
router.post('/login', employeeLoginLimiter, employeeControllers.loginEmployeePost);
router.get('/login', employeeControllers.loginEmployeeGet);





router.get('/reset', employeeControllers.resetAccountGet);
router.post('/reset', employeeControllers.resetAccountPost);
router.post('/reset/password', employeeControllers.resetPasswordPost);



// Protected routes (authentication required)
router.use(employeeAuth); // Apply authentication middleware to all routes below

// Profile routes
router.get('/profile/:id', employeeControllers.getProfile);
router.put('/profile/:id', employeeControllers.updateProfile);

// Team routes
router.get('/team/:teamId', teamControllers.teamdashboard);
router.get('/team/:teamId/members', teamControllers.getTeamMembers);
router.post('/team/:teamId/members', teamControllers.addTeamMember);
router.delete('/team/:teamId/members/:employeeId', teamControllers.removeTeamMember);

// Issue routes
router.get('/assigned-issues', assignedIssueControllers.assignedIssueList);
router.get('/assigned-issues/:id/solve', assignedIssueControllers.assignedIssueSolveGet);
router.post('/assigned-issues/:id/solve', assignedIssueControllers.assignedIssueSolvePost);

export default router;
