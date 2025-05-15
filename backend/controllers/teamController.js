import expressAsyncHandler from 'express-async-handler';
import * as teamService from '../services/teamService.js';

const asynchandler = expressAsyncHandler;

/**
 * GET /team/dashboard
 * Retrieves team dashboard with:
 * - Team details
 * - Member list
 * - Current projects
 * - Open issues
 */
export const teamdashboard = asynchandler(async(req, res, next) => {
    try {
        const teamId = req.team._id; // Assuming team is set in auth middleware
        const dashboardData = await teamService.getTeamDashboard(teamId);
        res.status(200).json(dashboardData);
    } catch (err) {
        next(err);
    }
});

/**
 * GET /team/create
 * Returns form fields required to create a new team
 * Includes all fields from team model as empty template
 */
export const teamcreationGet = asynchandler(async(req, res, next) => {
    try {
        const creationFields = teamService.getTeamCreationFields();
        res.status(200).json(creationFields);
    } catch (err) {
        next(err);
    }
});

/**
 * POST /team/create
 * Creates a new team record in database
 * Validates and processes creation form data
 * Returns the newly created team object
 */
export const teamcreationPost = asynchandler(async(req, res, next) => {
    try {
        const newTeam = await teamService.teamCreate(req.body);
        res.status(201).json(newTeam);
    } catch (err) {
        next(err);
    }
});

/**
 * GET /team/:teamId/delete
 * Returns confirmation data before deleting a team
 * Includes team details for verification
 */
export const teamdeletionGet = asynchandler(async(req, res, next) => {
    try {
        const teamDetails = await teamService.getTeamToDelete(req.params.teamId);
        res.status(200).json(teamDetails);
    } catch (err) {
        next(err);
    }
});

/**
 * DELETE /team/:teamId
 * Deletes an existing team record
 * Returns success message upon deletion
 */
export const teamdeletionPost = asynchandler(async(req, res, next) => {
    try {
        const result = await teamService.teamDelete(req.params.teamId);
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
});

/**
 * GET /team/:teamId/add-member
 * Returns form for adding a member to team
 * Includes employee selection options
 */
export const addMemeberGet = asynchandler(async(req, res, next) => {
    try {
        const addMemberData = await teamService.getAddMemberData(req.params.teamId);
        res.status(200).json(addMemberData);
    } catch (err) {
        next(err);
    }
});

/**
 * POST /team/:teamId/add-member
 * Adds a member to the team
 * Updates team members list
 * Returns updated team object
 */
export const addMemeberPost = asynchandler(async(req, res, next) => {
    try {
        const updatedTeam = await teamService.addTeamMember(
            req.params.teamId,
            req.body.employeeId
        );
        res.status(200).json(updatedTeam);
    } catch (err) {
        next(err);
    }
});

/**
 * GET /team/:teamId/remove-member
 * Returns form for removing a member from team
 * Includes current members list
 */
export const removeMemeberGet = asynchandler(async(req, res, next) => {
    try {
        const removeMemberData = await teamService.getRemoveMemberData(req.params.teamId);
        res.status(200).json(removeMemberData);
    } catch (err) {
        next(err);
    }
});

/**
 * POST /team/:teamId/remove-member
 * Removes a member from the team
 * Updates team members list
 * Returns updated team object
 */
export const removeMemeberPost = asynchandler(async(req, res, next) => {
    try {
        const updatedTeam = await teamService.removeTeamMember(
            req.params.teamId,
            req.body.employeeId
        );
        res.status(200).json(updatedTeam);
    } catch (err) {
        next(err);
    }
});
