import expressAsyncHandler from 'express-async-handler';
import * as createdIssueService from '../services/assignedIssueService.js';

const asynchandler = expressAsyncHandler;

/**
 * GET /assigned-issues
 * Retrieves list of all assigned issues
 * Returns array of issue objects with:
 * - Issue details
 * - Assignee information
 * - Current status
 */
export const assignedIssueList = asynchandler(async (req, res, next) => {
    try {
        const issues = await createdIssueService.getIssuesByStatus('assigned');
        res.status(200).json(issues);
    } catch (err) {
        next(err);
    }
});

/**
 * GET /assigned-issues/:id/solve
 * Returns form for marking an issue as solved
 * Includes issue details and solution fields
 */
export const assignedIssueSolveGet = asynchandler(async (req, res, next) => {
    try {
        const issue = await createdIssueService.getIssueById(req.params.id);
        res.status(200).json({
            issueDetails: issue,
            solutionFields: {
                solution: '',
                additionalNotes: ''
            }
        });
    } catch (err) {
        next(err);
    }
});

/**
 * POST /assigned-issues/:id/solve
 * Marks an assigned issue as solved
 * Updates issue status and stores solution details
 * Returns updated issue object
 */
export const assignedIssueSolvePost = asynchandler(async (req, res, next) => {
    try {
        const solvedIssue = await createdIssueService.updateIssue(
            req.params.id, 
            {
                status: 'solved',
                solution: req.body.solution,
                additionalNotes: req.body.additionalNotes,
                solvedAt: new Date()
            }
        );
        res.status(200).json(solvedIssue);
    } catch (err) {
        next(err);
    }
});


