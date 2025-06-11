import expressAsyncHandler from 'express-async-handler';
import * as teamService from '../services/teamService.js';
import * as genericError from '../services/genericError.js';

const asynchandler = expressAsyncHandler;

/**
 * GET /team/:teamId
 * Retrieves team dashboard with:
 * - Team details
 * - Member list
 * - Current projects
 * - Open issues
 */
export const teamdashboard = asynchandler(async(req, res, next) => {
    try {
        const teamId = req.params.teamId;
        console.log('Team dashboard request for team:', teamId);
        console.log('Authenticated employee:', req.employee);

        if (!teamId) {
            throw new genericError.BadRequestError('Team ID is required');
        }

        // Check if employee is a member of the team (either in teams array or single team field)
        const isMember = (req.employee.teams && req.employee.teams.some(team => 
            team._id.toString() === teamId.toString()
        )) || (req.employee.team && req.employee.team._id.toString() === teamId.toString());

        if (!isMember) {
            throw new genericError.UnauthorizedError('You are not a member of this team');
        }

        const dashboardData = await teamService.teamHome(teamId);
        
        if (!dashboardData) {
            throw new genericError.NotFoundError('Team not found');
        }

        // Log team members data
        console.log('Team members:', dashboardData.team.members);
        console.log('Team leaders:', dashboardData.team.teamLeaders);
        
        res.status(200).json(dashboardData);
    } catch (err) {
        console.error('Team dashboard error:', err);
        next(err);
    }
});

/**
 * GET /team/create
 * Returns form fields required to create a new team
 */
export const teamcreationGet = asynchandler(async(req, res, next) => {
    try {
        const creationFields = await teamService.getTeamCreationFields();
        res.status(200).json(creationFields);
    } catch (err) {
        next(err);
    }
});

/**
 * POST /team/create
 * Creates a new team
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
 * Returns team details for deletion confirmation
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
 * Deletes a team
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
 * GET /team/:teamId/members
 * Returns list of team members with their roles
 */
export const getTeamMembers = asynchandler(async(req, res, next) => {
    try {
        const { teamId } = req.params;
        
        if (!teamId) {
            throw new genericError.BadRequestError('Team ID is required');
        }

        const members = await teamService.getTeamMembers(teamId);
        console.log('Fetched team members:', members);
        res.status(200).json(members);
    } catch (err) {
        next(err);
    }
});

/**
 * POST /team/:teamId/members
 * Adds a member to the team
 */
export const addTeamMember = asynchandler(async(req, res, next) => {
    try {
        const { teamId } = req.params;
        const { employeeId } = req.body;
        
        if (!teamId || !employeeId) {
            throw new genericError.BadRequestError('Team ID and Employee ID are required');
        }

        const result = await teamService.addMember(teamId, employeeId);
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
});

/**
 * DELETE /team/:teamId/members/:employeeId
 * Removes a member from the team
 */
export const removeTeamMember = asynchandler(async(req, res, next) => {
    try {
        const { teamId, employeeId } = req.params;
        
        if (!teamId || !employeeId) {
            throw new genericError.BadRequestError('Team ID and Employee ID are required');
        }

        const result = await teamService.removeMember(teamId, employeeId);
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
});

/**
 * POST /team/:teamId/assign-leader
 * Assigns a leader to the team
 */
export const assignLeader = asynchandler(async(req, res, next) => {
    try {
        const { teamId } = req.params;
        const { employeeId } = req.body;
        console.log('[Assign Leader] Endpoint hit:', { teamId, employeeId });
        if (!teamId || !employeeId) {
            throw new genericError.BadRequestError('Team ID and Employee ID are required');
        }
        const updatedTeam = await teamService.assignLeader(teamId, employeeId);
        res.status(200).json(updatedTeam);
    } catch (err) {
        next(err);
    }
});

export default {
    teamdashboard,
    teamcreationGet,
    teamcreationPost,
    teamdeletionGet,
    teamdeletionPost,
    getTeamMembers,
    addTeamMember,
    removeTeamMember,
    assignLeader
};
