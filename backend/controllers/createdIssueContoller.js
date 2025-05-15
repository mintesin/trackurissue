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
        const issueDetails = await createdIssueService.getIssueToDelete(req.params.id);
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
        const result = await createdIssueService.deleteIssue(req.params.id);
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
        const issueData = await createdIssueService.getIssueToEdit(req.params.id);
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
        const updatedIssue = await createdIssueService.updateIssue(
            req.params.id, 
            req.body
        );
        res.status(200).json(updatedIssue);
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
        const assignData = await createdIssueService.getAssignIssueData(req.params.id);
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
        const assignedIssue = await createdIssueService.assignIssue(
            req.params.id,
            req.body.assigneeId,
            req.body.assigneeType
        );
        res.status(200).json(assignedIssue);
    } catch (err) {
        next(err);
    }
});
