import * as milestoneService from '../services/milestoneService.js';
import * as genericError from '../services/genericError.js';

/**
 * Create a new milestone
 */
export const createMilestone = async (req, res, next) => {
    try {
        const milestoneData = {
            ...req.body,
            company: req.user.company || req.user.id, // Handle both employee and company users
            createdBy: req.user._id
        };

        const milestone = await milestoneService.createMilestone(milestoneData);
        
        res.status(201).json({
            success: true,
            message: 'Milestone created successfully',
            data: milestone
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all milestones for a team
 */
export const getMilestonesByTeam = async (req, res, next) => {
    try {
        const { teamId } = req.params;
        const milestones = await milestoneService.getMilestonesByTeam(teamId);
        
        res.status(200).json({
            success: true,
            data: milestones
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get milestone by ID
 */
export const getMilestoneById = async (req, res, next) => {
    try {
        const { milestoneId } = req.params;
        const milestone = await milestoneService.getMilestoneById(milestoneId);
        
        res.status(200).json({
            success: true,
            data: milestone
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update milestone
 */
export const updateMilestone = async (req, res, next) => {
    try {
        const { milestoneId } = req.params;
        const milestone = await milestoneService.updateMilestone(milestoneId, req.body);
        
        res.status(200).json({
            success: true,
            message: 'Milestone updated successfully',
            data: milestone
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Add issue to milestone
 */
export const addIssueToMilestone = async (req, res, next) => {
    try {
        const { milestoneId, issueId } = req.params;
        const milestone = await milestoneService.addIssueToMilestone(milestoneId, issueId);
        
        // Update milestone progress after adding issue
        await milestoneService.updateMilestoneProgress(milestoneId);
        
        res.status(200).json({
            success: true,
            message: 'Issue added to milestone successfully',
            data: milestone
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Remove issue from milestone
 */
export const removeIssueFromMilestone = async (req, res, next) => {
    try {
        const { milestoneId, issueId } = req.params;
        const milestone = await milestoneService.removeIssueFromMilestone(milestoneId, issueId);
        
        // Update milestone progress after removing issue
        await milestoneService.updateMilestoneProgress(milestoneId);
        
        res.status(200).json({
            success: true,
            message: 'Issue removed from milestone successfully',
            data: milestone
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update milestone progress
 */
export const updateMilestoneProgress = async (req, res, next) => {
    try {
        const { milestoneId } = req.params;
        const milestone = await milestoneService.updateMilestoneProgress(milestoneId);
        
        res.status(200).json({
            success: true,
            message: 'Milestone progress updated successfully',
            data: milestone
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete milestone
 */
export const deleteMilestone = async (req, res, next) => {
    try {
        const { milestoneId } = req.params;
        const result = await milestoneService.deleteMilestone(milestoneId);
        
        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
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
