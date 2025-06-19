import mongoose from 'mongoose';
import assignedIssueModel from '../models/assignedIssueModel.js';
import teamModel from '../models/teamModel.js';
import * as createdIssueService from './createdIssueService.js';
import Notification from '../models/notificationModel.js';

/**
//  * Get all assigned issues for a team
 * @param {string} teamId - The team ID
 * @returns {Promise<Array>} Array of assigned issues
 */
export const getAssignedIssues = async (teamId) => {
    try {
        // console.log('Service - Getting assigned issues for team:', teamId);
        
        const team = await teamModel.findById(teamId).lean();
        if (!team) {
            throw new Error('Team not found');
        }
        
        const issues = await assignedIssueModel.find({ team: teamId })
            .populate({
                path: 'issue',
                select: 'topic description urgency status createdAt company',
                model: 'createdIssue'
            })
            .populate({
                path: 'assignee',
                select: 'firstName lastName email',
                model: 'Employee'
            })
            .populate({
                path: 'team',
                select: 'teamName',
                model: 'Team'
            })
            .lean();

        if (!issues || issues.length === 0) {
            // console.log('No issues found for team:', teamId);
            return [];
        }

        // console.log('Service - Found issues:', issues);
        return issues;
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
            .populate({
                path: 'issue',
                select: 'topic description urgency status createdAt company',
                model: 'createdIssue'
            })
            .populate({
                path: 'assignee',
                select: 'firstName lastName email',
                model: 'Employee'
            })
            .lean();
            
        if (!issue) {
            throw new Error('Assigned issue not found');
        }

        return {
            ...issue,
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
            { 
                new: true,
                populate: [
                    {
                        path: 'issue',
                        select: 'topic description urgency status createdAt company',
                        model: 'createdIssue'
                    },
                    {
                        path: 'assignee',
                        select: 'firstName lastName email',
                        model: 'Employee'
                    }
                ]
            }
        ).lean();

        // Update original issue with solution
        let createdIssueId;
        if (updatedAssignedIssue && updatedAssignedIssue.issue) {
            createdIssueId = typeof updatedAssignedIssue.issue === 'object'
                ? updatedAssignedIssue.issue._id
                : updatedAssignedIssue.issue;
        } else {
            throw new Error('Assigned issue does not have a valid issue reference');
        }

        // Now use createdIssueId below this point
        const updatedIssue = await createdIssueService.updateIssue(
            createdIssueId,
            {
                status: 'solved',
                solution,
                additionalNotes,
                solvedAt: new Date()
            }
        );

        // Create notification for the assignee (if exists)
        if (updatedAssignedIssue.assignee) {
            await Notification.create({
                user: updatedAssignedIssue.assignee,
                type: 'issue_status',
                message: `Issue "${updatedIssue.topic}" has been marked as solved.`,
                data: {
                    issueId: createdIssueId,
                    status: 'solved'
                }
            });
        }

        return {
            ...updatedAssignedIssue,
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
