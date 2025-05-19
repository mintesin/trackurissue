import expressAsyncHandler from 'express-async-handler';
import * as assignedIssueService from '../services/assignedIssueService.js';

const asyncHandler = expressAsyncHandler;

/**
 * GET /assigned-issues
 * Retrieves list of all assigned issues
 */
export const assignedIssueList = asyncHandler(async (req, res) => {
    try {
        // Get teamId from authenticated employee
        const teamId = req.employee.team;
        if (!teamId) {
            return res.status(400).json({ message: 'No team assigned to employee' });
        }

        console.log('Controller - Fetching issues for team:', teamId);
        console.log('Controller - Employee:', req.employee);

        const issues = await assignedIssueService.getAssignedIssues(teamId);
        
        // Always return an array, even if empty
        const issuesList = issues || [];
        console.log('Controller - Found issues:', issuesList);
        
        res.status(200).json(issuesList);
    } catch (err) {
        console.error('Controller - Error:', err);
        res.status(500).json({ 
            message: 'Error fetching assigned issues',
            error: err.message 
        });
    }
});

/**
 * GET /assigned-issues/:id/solve
 * Returns form for marking an issue as solved
 */
export const assignedIssueSolveGet = asyncHandler(async (req, res) => {
    try {
        const issue = await assignedIssueService.getSolveIssueData(req.params.id);
        res.status(200).json({
            issueDetails: issue,
            solutionFields: {
                solution: '',
                additionalNotes: ''
            }
        });
    } catch (err) {
        console.error('Get solve issue error:', err);
        res.status(500).json({ message: err.message });
    }
});

/**
 * POST /assigned-issues/:id/solve
 * Marks an assigned issue as solved
 */
export const assignedIssueSolvePost = asyncHandler(async (req, res) => {
    try {
        const { solution, additionalNotes } = req.body;
        const solvedIssue = await assignedIssueService.solveIssue(
            req.params.id,
            solution,
            additionalNotes
        );
        res.status(200).json(solvedIssue);
    } catch (err) {
        console.error('Solve issue error:', err);
        res.status(500).json({ message: err.message });
    }
});

export default {
    assignedIssueList,
    assignedIssueSolveGet,
    assignedIssueSolvePost
};
