import express from 'express';
import * as teamController from '../controllers/teamController.js';
import { employeeAuth } from '../middleware/employeeAuthMiddleware.js';

const router = express.Router();

// All team routes require employee authentication
router.use(employeeAuth);

// Team dashboard and member management routes
router.get('/:teamId', teamController.teamdashboard);
router.get('/:teamId/members', teamController.getTeamMembers);
router.post('/:teamId/members', teamController.addTeamMember);
router.delete('/:teamId/members/:employeeId', teamController.removeTeamMember);

export default router;
