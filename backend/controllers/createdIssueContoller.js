import expressAsyncHandler from 'express-async-handler';
import * as createdIssueService from '../services/createdIssueService.js';

const asynchandler = expressAsyncHandler;

/**
 * GET /issues
 * Retrieves list of all created issues
 * Returns array of issue objects with basic info
 */
export const issuelist = asynchandler(async(req, res, next) => {
    try {
        const issues = await createdIssueService.getIssueList();
        res.status(200).json(issues);
    } catch (err) {
        next(err);
    }
});

/**
 * GET /issues/create
 * Returns form fields required to create a new issue
 * Includes all fields from issue model as empty template
 */
export const issueCreateGet = asynchandler(async(req, res, next) => {
    try {
        const createFields = createdIssueService.createIssueGet();
        res.status(200).json(createFields);
    } catch (err) {
        next(err);
    }
});

/**
 * POST /issues/create
 * Creates a new issue record in database
 * Validates and processes creation form data
 * Returns the newly created issue object
 */
export const issueCreatePost = asynchandler(async(req, res, next) => {
    try {
        const newIssue = await createdIssueService.createIssuePost(req.body);
        res.status(201).json(newIssue);
    } catch (err) {
        next(err);
    }
});

/**
 * GET /issues/:id/delete
 * Returns confirmation data before deleting an issue
 * Includes issue details for verification
 */
export const issueDeleteGet = asynchandler(async(req, res, next) => {
    try {
        const { issueId } = req.params;
        if (!issueId) {
            throw new Error('Issue ID is required');
        }
        const issueDetails = await createdIssueService.getIssueToDelete(issueId);
        res.status(200).json(issueDetails);
    } catch (err) {
        next(err);
    }
});

/**
 * DELETE /issues/:id
 * Deletes an existing issue record
 * Returns success message upon deletion
 */
export const issueDeletePost = asynchandler(async(req, res, next) => {
    try {
        const { issueId } = req.params;
        if (!issueId) {
            throw new Error('Issue ID is required');
        }
        const result = await createdIssueService.deleteIssue(issueId);
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
});

/**
 * GET /issues/:id/edit
 * Returns issue data for editing
 * Includes all editable fields pre-populated
 */
export const editIssueGet = asynchandler(async(req, res, next) => {
    try {
        const { issueId } = req.params;
        if (!issueId) {
            throw new Error('Issue ID is required');
        }
        const issueData = await createdIssueService.getIssueToEdit(issueId);
        res.status(200).json(issueData);
    } catch (err) {
        next(err);
    }
});

/**
 * PUT /issues/:id
 * Updates an existing issue record
 * Validates and processes edit form data
 * Returns the updated issue object
 */
export const editIssuePost = asynchandler(async(req, res, next) => {
    try {
        const { issueId } = req.params;
        if (!issueId) {
            throw new Error('Issue ID is required');
        }
        const updatedIssue = await createdIssueService.editedIssuePost(
            issueId, 
            req.body
        );
        res.status(200).json(updatedIssue);
    } catch (err) {
        next(err);
    }
});

/**
 * GET /issues/:id
 * Returns a single issue by ID
 * Includes all issue details
 */
export const getIssue = asynchandler(async(req, res, next) => {
    try {
        const { issueId } = req.params;
        if (!issueId) {
            throw new Error('Issue ID is required');
        }
        const issue = await createdIssueService.getIssue(issueId);
        if (!issue) {
            throw new Error('Issue not found');
        }
        res.status(200).json({ 
            data: {
                ...issue,
                assignedTeam: issue.assignedTeam
            } 
        });
    } catch (err) {
        next(err);
    }
});

/**
 * GET /issues/:id/assign
 * Returns form for assigning an issue
 * Includes assignee selection options
 */
export const assignIssueGet = asynchandler(async(req, res, next) => {
    try {
        const { issueId } = req.params;
        if (!issueId) {
            throw new Error('Issue ID is required');
        }
        const assignData = await createdIssueService.getAssignIssueData(issueId);
        res.status(200).json(assignData);
    } catch (err) {
        next(err);
    }
});

/**
 * POST /issues/:id/assign
 * Assigns an issue to an employee/team
 * Updates issue status to 'assigned'
 * Returns updated issue object
 */
export const assignIssuePost = asynchandler(async(req, res, next) => {
    try {
        const { issueId } = req.params;
        const { assigneeId } = req.body;

        if (!issueId || !assigneeId) {
            return res.status(400).json({
                error: 'Issue ID and Team ID are required'
            });
        }

        try {
            const assignedIssue = await createdIssueService.assignIssue(
                issueId,
                assigneeId,
                {
                    assignedAt: new Date().toISOString()
                }
            );

            res.status(200).json({ 
                data: assignedIssue,
                message: 'Issue assigned successfully'
            });
        } catch (error) {
            // Check if this is our "already assigned" error
            if (error.message && error.message.includes('already been assigned')) {
                return res.status(409).json({
                    error: error.message
                });
            }
            // For other errors, re-throw to be caught by the outer catch
            throw error;
        }
    } catch (err) {
        next(err);
    }
});
