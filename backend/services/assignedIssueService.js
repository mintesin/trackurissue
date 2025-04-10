import mongoose from 'mongoose';
import assignedIssueModel from '../models/assignedIssueModel.js';
import teamModel from '../models/teamModel.js';
import * as createdIssueService from './createdIssueService.js';

/**
 * Get all assigned issues for a team
 * @param {string} teamId - The team ID
 * @returns {Promise<Array>} Array of assigned issues
 */
export const getAssignedIssues = async (teamId) => {
    try {
        const team = await teamModel.findById(teamId);
        if (!team) {
            throw new Error('Team not found');
        }
        
        return await assignedIssueModel.find({ team: teamId })
            .populate('issue')
            .populate('assignee');
    } catch (error) {
        throw error;
    }
};

/**
 * Get data needed to solve an issue
 * @param {string} issueId - The issue ID
 * @returns {Promise<Object>} Issue solve form data
 */
export const getSolveIssueData = async (issueId) => {
    try {
        const issue = await assignedIssueModel.findById(issueId)
            .populate('issue')
            .populate('assignee');
            
        if (!issue) {
            throw new Error('Assigned issue not found');
        }

        return {
            issueDetails: issue,
            solutionFields: {
                solution: '',
                additionalNotes: ''
            }
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Mark an issue as solved
 * @param {string} issueId - The issue ID
 * @param {string} solution - The solution text
 * @param {string} additionalNotes - Additional notes
 * @returns {Promise<Object>} Updated issue
 */
export const solveIssue = async (issueId, solution, additionalNotes) => {
    try {
        // Update assigned issue status
        const updatedAssignedIssue = await assignedIssueModel.findByIdAndUpdate(
            issueId,
            { status: 'solved' },
            { new: true }
        );

        // Update original issue with solution
        const updatedIssue = await createdIssueService.updateIssue(
            updatedAssignedIssue.issue,
            {
                status: 'solved',
                solution,
                additionalNotes,
                solvedAt: new Date()
            }
        );

        return {
            ...updatedAssignedIssue.toObject(),
            issue: updatedIssue
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Get count of assigned issues for a team
 * @param {string} teamId - The team ID
 * @returns {Promise<number>} Count of assigned issues
 */
export const getAssignedIssuesCount = async (teamId) => {
    try {
        return await assignedIssueModel.countDocuments({ team: teamId });
    } catch (error) {
        throw error;
    }
};

/**
 * Get all assigned issues (alias for getAssignedIssues)
 * @param {string} teamId - The team ID
 * @returns {Promise<Array>} Array of assigned issues
 */
export const allassignedIssues = async (teamId) => {
    return await getAssignedIssues(teamId);
};
