import Sprint from '../models/sprintModel.js';
import crIssueModel from '../models/createdIssueModel.js';
import * as genericError from './genericError.js';

/**
 * Create a new sprint
 */
export const createSprint = async (sprintData) => {
    try {
        const { name, description, startDate, endDate, team, company } = sprintData;

        // Validate dates
        if (new Date(startDate) >= new Date(endDate)) {
            throw new genericError.BadRequestError('Start date must be before end date');
        }

        const sprint = new Sprint({
            name,
            description,
            startDate,
            endDate,
            team,
            company
        });

        await sprint.save();
        return sprint;
    } catch (error) {
        if (error.name === 'ValidationError') {
            throw new genericError.BadRequestError(error.message);
        }
        throw error;
    }
};

/**
 * Get all sprints for a team
 */
export const getSprintsByTeam = async (teamId) => {
    try {
        const sprints = await Sprint.find({ team: teamId })
            .populate('issues')
            .sort({ createdAt: -1 });
        return sprints;
    } catch (error) {
        throw new genericError.OperationError('Failed to fetch sprints');
    }
};

/**
 * Get sprint by ID
 */
export const getSprintById = async (sprintId) => {
    try {
        const sprint = await Sprint.findById(sprintId)
            .populate('team')
            .populate('company')
            .populate('issues');
        
        if (!sprint) {
            throw new genericError.NotFoundError('Sprint not found');
        }
        
        return sprint;
    } catch (error) {
        if (error.name === 'CastError') {
            throw new genericError.BadRequestError('Invalid sprint ID');
        }
        throw error;
    }
};

/**
 * Update sprint
 */
export const updateSprint = async (sprintId, updateData) => {
    try {
        const sprint = await Sprint.findByIdAndUpdate(
            sprintId,
            updateData,
            { new: true, runValidators: true }
        );

        if (!sprint) {
            throw new genericError.NotFoundError('Sprint not found');
        }

        return sprint;
    } catch (error) {
        if (error.name === 'ValidationError') {
            throw new genericError.BadRequestError(error.message);
        }
        throw error;
    }
};

/**
 * Add issue to sprint
 */
export const addIssueToSprint = async (sprintId, issueId) => {
    try {
        const sprint = await Sprint.findById(sprintId);
        if (!sprint) {
            throw new genericError.NotFoundError('Sprint not found');
        }

        // Check if issue exists
        const issue = await crIssueModel.findById(issueId);
        if (!issue) {
            throw new genericError.NotFoundError('Issue not found');
        }

        // Add issue to sprint if not already added
        if (!sprint.issues.includes(issueId)) {
            sprint.issues.push(issueId);
            await sprint.save();
        }

        // Update issue with sprint reference
        issue.sprint = sprintId;
        await issue.save();

        return sprint;
    } catch (error) {
        throw error;
    }
};

/**
 * Remove issue from sprint
 */
export const removeIssueFromSprint = async (sprintId, issueId) => {
    try {
        const sprint = await Sprint.findById(sprintId);
        if (!sprint) {
            throw new genericError.NotFoundError('Sprint not found');
        }

        // Remove issue from sprint
        sprint.issues = sprint.issues.filter(id => id.toString() !== issueId);
        await sprint.save();

        // Remove sprint reference from issue
        await crIssueModel.findByIdAndUpdate(issueId, { sprint: null });

        return sprint;
    } catch (error) {
        throw error;
    }
};

/**
 * Delete sprint
 */
export const deleteSprint = async (sprintId) => {
    try {
        const sprint = await Sprint.findById(sprintId);
        if (!sprint) {
            throw new genericError.NotFoundError('Sprint not found');
        }

        // Remove sprint reference from all issues
        await crIssueModel.updateMany(
            { sprint: sprintId },
            { sprint: null }
        );

        await Sprint.findByIdAndDelete(sprintId);
        return { message: 'Sprint deleted successfully' };
    } catch (error) {
        throw error;
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
