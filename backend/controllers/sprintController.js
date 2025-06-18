import * as sprintService from '../services/sprintService.js';
import * as genericError from '../services/genericError.js';

/**
 * Create a new sprint
 */
export const createSprint = async (req, res, next) => {
    try {
        const sprintData = {
            ...req.body,
            company: req.user.company || req.user.id // Handle both employee and company users
        };

        const sprint = await sprintService.createSprint(sprintData);
        
        res.status(201).json({
            success: true,
            message: 'Sprint created successfully',
            data: sprint
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all sprints for a team
 */
export const getSprintsByTeam = async (req, res, next) => {
    try {
        const { teamId } = req.params;
        const sprints = await sprintService.getSprintsByTeam(teamId);
        
        res.status(200).json({
            success: true,
            data: sprints
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get sprint by ID
 */
export const getSprintById = async (req, res, next) => {
    try {
        const { sprintId } = req.params;
        const sprint = await sprintService.getSprintById(sprintId);
        
        res.status(200).json({
            success: true,
            data: sprint
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update sprint
 */
export const updateSprint = async (req, res, next) => {
    try {
        const { sprintId } = req.params;
        const sprint = await sprintService.updateSprint(sprintId, req.body);
        
        res.status(200).json({
            success: true,
            message: 'Sprint updated successfully',
            data: sprint
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Add issue to sprint
 */
export const addIssueToSprint = async (req, res, next) => {
    try {
        const { sprintId, issueId } = req.params;
        const sprint = await sprintService.addIssueToSprint(sprintId, issueId);
        
        res.status(200).json({
            success: true,
            message: 'Issue added to sprint successfully',
            data: sprint
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Remove issue from sprint
 */
export const removeIssueFromSprint = async (req, res, next) => {
    try {
        const { sprintId, issueId } = req.params;
        const sprint = await sprintService.removeIssueFromSprint(sprintId, issueId);
        
        res.status(200).json({
            success: true,
            message: 'Issue removed from sprint successfully',
            data: sprint
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete sprint
 */
export const deleteSprint = async (req, res, next) => {
    try {
        const { sprintId } = req.params;
        const result = await sprintService.deleteSprint(sprintId);
        
        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};

export default {
    createSprint,
    getSprintsByTeam,
    getSprintById,
    updateSprint,
    addIssueToSprint,
    removeIssueFromSprint,
    deleteSprint
};
