import express from 'express';
import * as milestoneController from '../controllers/milestoneController.js';
import { companyAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(companyAuth);

// Milestone routes
router.post('/', milestoneController.createMilestone);
router.get('/team/:teamId', milestoneController.getMilestonesByTeam);
router.get('/:milestoneId', milestoneController.getMilestoneById);
router.put('/:milestoneId', milestoneController.updateMilestone);
router.delete('/:milestoneId', milestoneController.deleteMilestone);

// Issue management in milestones
router.post('/:milestoneId/issues/:issueId', milestoneController.addIssueToMilestone);
router.delete('/:milestoneId/issues/:issueId', milestoneController.removeIssueFromMilestone);

// Progress management
router.put('/:milestoneId/progress', milestoneController.updateMilestoneProgress);

export default router;
