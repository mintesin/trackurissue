import express from 'express';
import * as sprintController from '../controllers/sprintController.js';
import { companyAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(companyAuth);

// Sprint routes
router.post('/', sprintController.createSprint);
router.get('/team/:teamId', sprintController.getSprintsByTeam);
router.get('/:sprintId', sprintController.getSprintById);
router.put('/:sprintId', sprintController.updateSprint);
router.delete('/:sprintId', sprintController.deleteSprint);

// Issue management in sprints
router.post('/:sprintId/issues/:issueId', sprintController.addIssueToSprint);
router.delete('/:sprintId/issues/:issueId', sprintController.removeIssueFromSprint);

export default router;
