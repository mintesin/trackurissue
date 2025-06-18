import Milestone from '../models/milestoneModel.js';
import crIssueModel from '../models/createdIssueModel.js';
import * as genericError from './genericError.js';

/**
 * Create a new milestone
 */
export const createMilestone = async (milestoneData) => {
    try {
        const { title, description, dueDate, team, company, createdBy } = milestoneData;

        const milestone = new Milestone({
            title,
            description,
            dueDate,
            team,
            company,
            createdBy
        });

        await milestone.save();
        return milestone;
    } catch (error) {
        if (error.name === 'ValidationError') {
            throw new genericError.BadRequestError(error.message);
        }
        throw error;
    }
};

/**
 * Get all milestones for a team
 */
export const getMilestonesByTeam = async (teamId) => {
    try {
        const milestones = await Milestone.find({ team: teamId })
            .populate('issues')
            .populate('createdBy', 'firstName lastName')
            .sort({ dueDate: 1 });
        return milestones;
    } catch (error) {
        throw new genericError.OperationError('Failed to fetch milestones');
    }
};

/**
 * Get milestone by ID
 */
export const getMilestoneById = async (milestoneId) => {
    try {
        const milestone = await Milestone.findById(milestoneId)
            .populate('team')
            .populate('company')
            .populate('issues')
            .populate('createdBy', 'firstName lastName');
        
        if (!milestone) {
            throw new genericError.NotFoundError('Milestone not found');
        }
        
        return milestone;
    } catch (error) {
        if (error.name === 'CastError') {
            throw new genericError.BadRequestError('Invalid milestone ID');
        }
        throw error;
    }
};

/**
 * Update milestone
 */
export const updateMilestone = async (milestoneId, updateData) => {
    try {
        const milestone = await Milestone.findByIdAndUpdate(
            milestoneId,
            updateData,
            { new: true, runValidators: true }
        );

        if (!milestone) {
            throw new genericError.NotFoundError('Milestone not found');
        }

        return milestone;
    } catch (error) {
        if (error.name === 'ValidationError') {
            throw new genericError.BadRequestError(error.message);
        }
        throw error;
    }
};

/**
 * Add issue to milestone
 */
export const addIssueToMilestone = async (milestoneId, issueId) => {
    try {
        const milestone = await Milestone.findById(milestoneId);
        if (!milestone) {
            throw new genericError.NotFoundError('Milestone not found');
        }

        // Check if issue exists
        const issue = await crIssueModel.findById(issueId);
        if (!issue) {
            throw new genericError.NotFoundError('Issue not found');
        }

        // Add issue to milestone if not already added
        if (!milestone.issues.includes(issueId)) {
            milestone.issues.push(issueId);
            await milestone.save();
        }

        // Update issue with milestone reference
        issue.milestone = milestoneId;
        await issue.save();

        return milestone;
    } catch (error) {
        throw error;
    }
};

/**
 * Remove issue from milestone
 */
export const removeIssueFromMilestone = async (milestoneId, issueId) => {
    try {
        const milestone = await Milestone.findById(milestoneId);
        if (!milestone) {
            throw new genericError.NotFoundError('Milestone not found');
        }

        // Remove issue from milestone
        milestone.issues = milestone.issues.filter(id => id.toString() !== issueId);
        await milestone.save();

        // Remove milestone reference from issue
        await crIssueModel.findByIdAndUpdate(issueId, { milestone: null });

        return milestone;
    } catch (error) {
        throw error;
    }
};

/**
 * Update milestone progress
 */
export const updateMilestoneProgress = async (milestoneId) => {
    try {
        const milestone = await Milestone.findById(milestoneId).populate('issues');
        if (!milestone) {
            throw new genericError.NotFoundError('Milestone not found');
        }

        if (milestone.issues.length === 0) {
            milestone.progress = 0;
        } else {
            const completedIssues = milestone.issues.filter(issue => 
                issue.status === 'solved' || issue.kanbanStatus === 'done'
            ).length;
            milestone.progress = Math.round((completedIssues / milestone.issues.length) * 100);
        }

        await milestone.save();
        return milestone;
    } catch (error) {
        throw error;
    }
};

/**
 * Delete milestone
 */
export const deleteMilestone = async (milestoneId) => {
    try {
        const milestone = await Milestone.findById(milestoneId);
        if (!milestone) {
            throw new genericError.NotFoundError('Milestone not found');
        }

        // Remove milestone reference from all issues
        await crIssueModel.updateMany(
            { milestone: milestoneId },
            { milestone: null }
        );

        await Milestone.findByIdAndDelete(milestoneId);
        return { message: 'Milestone deleted successfully' };
    } catch (error) {
        throw error;
    }
};

export default {
    createMilestone,
    getMilestonesByTeam,
    getMilestoneById,
    updateMilestone,
    addIssueToMilestone,
    removeIssueFromMilestone,
    updateMilestoneProgress,
    deleteMilestone
};
