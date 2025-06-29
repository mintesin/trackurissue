import mongoose from 'mongoose'
import crIssueModel from '../models/createdIssueModel.js'
import teamModel from '../models/teamModel.js'
import assignedIssueModel from '../models/assignedIssueModel.js'
import * as genericError from './genericError.js'
import Notification from '../models/notificationModel.js'

// Helper function to sanitize issue data
const sanitizeIssueData = (issue) => {
    const { topic, description, createdAt, urgency, status, assignedTeam } = issue;
    return { topic, description, createdAt, urgency, status, assignedTeam };
};

/**
 * Gets default values for creating a new issue
 */
export const createIssueGet = () => {
    let issueDate = {
        "topic": "",
        "description": "",
        "createdAt": "",
        "createdBy": "",
        "urgency": "",
        "status": "",
        "company": ""
    } 
    return { ...issueDate }
}

/**
 * Creates a new issue in the database
 */
export const createIssuePost = async (issueDetail) => {
    try {
        // Validate required fields
        const requiredFields = ['topic', 'description', 'createdBy', 'company'];
        for (const field of requiredFields) {
            if (!issueDetail[field]) {
                throw new Error(`${field} is required`);
            }
        }

        // Validate ObjectId fields
        const objectIdFields = ['createdBy', 'company'];
        for (const field of objectIdFields) {
            if (!mongoose.Types.ObjectId.isValid(issueDetail[field])) {
                throw new Error(`Invalid ${field} ID format`);
            }
        }

        // Set default values if not provided
        const issueData = {
            ...issueDetail,
            urgency: issueDetail.urgency || 'notUrgent',
            status: issueDetail.status || 'created',
            createdAt: issueDetail.createdAt || new Date()
        };

        let issueInstance = new crIssueModel(issueData);
        await issueInstance.save();
        return sanitizeIssueData(issueInstance.toObject());
    }
    catch(err) {
        throw new genericError.OperationError(err.message || "Creating the Issue has failed");
    }
}

/**
 * Gets a single issue by ID
 */
export const getIssue = async (issueId) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(issueId)) {
            throw new Error('Invalid issue ID format');
        }

        const issue = await crIssueModel.findById(issueId)
            .select('topic description createdAt urgency status')
            .lean();

        if (!issue) {
            throw new genericError.NotFoundError("Issue not found");
        }

        // If issue is assigned, get the team information
        if (issue.status === 'assigned') {
            try {
                // Find the assigned issue and populate team info
                const assignedIssue = await assignedIssueModel
                    .findOne({ issue: issueId })
                    .populate({
                        path: 'team',
                        select: 'teamName',
                        model: teamModel
                    })
                    .lean();

                if (assignedIssue?.team) {
                    issue.assignedTeam = assignedIssue.team.teamName;
                }
            } catch (err) {
                // Continue without team info rather than failing
            }
        }

        return {
            topic: issue.topic,
            description: issue.description,
            createdAt: issue.createdAt,
            urgency: issue.urgency || 'notUrgent',
            status: issue.status || 'created',
            assignedTeam: issue.assignedTeam || null
        };
    } catch (err) {
        throw new genericError.OperationError(err.message || "Failed to retrieve issue");
    }
};

/**
 * Gets an issue for editing
 */
export const editIssueGet = async (issueId) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(issueId)) {
            throw new Error('Invalid issue ID format');
        }

        let editedIssue = await crIssueModel.findById(issueId)
            .select('topic description createdAt urgency status')
            .lean();
            
        if(!editedIssue) {
            throw new genericError.NotFoundError("Issue not found");
        }
        return editedIssue;
    }
    catch(err) {
        throw new genericError.OperationError(err.message || "Failed to get issue for editing");
    }
}

/**
 * Updates an existing issue
 */
export const editedIssuePost = async (issueId, updatedData) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(issueId)) {
            throw new Error('Invalid issue ID format');
        }

        // Don't override status if it's being solved
        if (!updatedData.status || updatedData.status !== 'solved') {
            updatedData.status = "edited";
        }
        
        const updatedIssue = await crIssueModel.findByIdAndUpdate(
            issueId,
            updatedData,
            { 
                new: true,
                select: 'topic description urgency status solution additionalNotes solvedAt'
            }
        );

        if (!updatedIssue) {
            throw new Error("Issue not found");
        }

        return updatedIssue.toObject();
    }
    catch (err) {
        throw new genericError.OperationError(err.message || "Failed to update issue");
    }
}

/**
 * Updates an issue with solution details
 * @param {string} issueId - The ID of the issue to update
 * @param {Object} data - The solution data
 * @returns {Promise<Object>} Returns the updated issue
 */
export const updateIssue = async (issueId, data) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(issueId)) {
            throw new Error('Invalid issue ID format');
        }

        const updatedIssue = await crIssueModel.findByIdAndUpdate(
            issueId,
            {
                ...data,
                status: 'solved',
                solvedAt: new Date()
            },
            { 
                new: true,
                select: 'topic description urgency status solution additionalNotes solvedAt'
            }
        );

        if (!updatedIssue) {
            throw new Error("Issue not found");
        }

        return updatedIssue.toObject();
    }
    catch (err) {
        throw new genericError.OperationError(err.message || "Failed to update issue with solution");
    }
}

/**
 * Deletes an issue
 */
export const deleteIssue = async (issueId) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(issueId)) {
            throw new Error('Invalid issue ID format');
        }

        // Delete any assigned issues first
        await assignedIssueModel.deleteMany({ issue: issueId });

        // Then delete the created issue
        const deletedIssue = await crIssueModel.findByIdAndDelete(issueId);
        if (!deletedIssue) {
            throw new genericError.NotFoundError("Issue not found");
        }

        return sanitizeIssueData(deletedIssue.toObject());
    }
    catch(err) {
        throw new genericError.OperationError(err.message || "Failed to delete issue");
    }
}

/**
 * Marks an issue as solved
 */
export const solveIssuePost = async (issueId) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(issueId)) {
            throw new Error('Invalid issue ID format');
        }

        const updatedIssue = await crIssueModel.findByIdAndUpdate(
            issueId,
            { status: 'solved' },
            { new: true }
        );

        if (!updatedIssue) {
            throw new Error("Issue not found");
        }

        return sanitizeIssueData(updatedIssue.toObject());
    }
    catch(err) {
        throw new genericError.OperationError(err.message || "Failed to mark issue as solved");
    }
}

/**
 * Assigns an issue to a team
 * @param {string} issueId - The ID of the issue to assign
 * @param {string} teamId - The ID of the team to assign to
 * @returns {Promise<Object>} Returns the assigned issue with team info
 * @throws {OperationError} If assignment fails
 */
export const assignIssue = async (issueId, teamId) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(issueId) || !mongoose.Types.ObjectId.isValid(teamId)) {
            throw new Error('Invalid ID format');
        }

        // Check if issue is already assigned
        const existingAssignment = await assignedIssueModel.findOne({ issue: issueId });
        if (existingAssignment) {
            throw new genericError.OperationError("This issue has already been assigned. Please edit the existing assignment instead.");
        }

        let [theIssue, theTeam] = await Promise.all([
            crIssueModel.findById(issueId).select('topic description createdAt urgency status'),
            teamModel.findById(teamId).select('teamName description members')
        ]);

        if (!theIssue) {
            throw new genericError.NotFoundError("Issue not found");
        }
        if (!theTeam) {
            throw new genericError.NotFoundError("Team not found");
        }

        theIssue.status = "assigned";
        
        let assignedIssueInstance = new assignedIssueModel({
            issue: issueId,
            team: teamId,
            assignedAt: new Date(),
            status: 'assigned'
        });

        await Promise.all([
            theIssue.save(),
            assignedIssueInstance.save()
        ]);

        // Notify all team members about the new assignment
        if (Array.isArray(theTeam.members)) {
            await Promise.all(theTeam.members.map(memberId =>
                Notification.create({
                    user: memberId,
                    type: 'issue_assigned',
                    message: `A new issue "${theIssue.topic}" has been assigned to your team (${theTeam.teamName}).`,
                    data: {
                        issueId: theIssue._id,
                        teamId: theTeam._id
                    }
                })
            ));
        }

        const issueWithTeam = {
            ...theIssue.toObject(),
            assignedTeam: theTeam.teamName
        };

        return {
            issue: sanitizeIssueData(issueWithTeam),
            team: {
                id: theTeam._id,
                name: theTeam.teamName
            }
        };
    } catch (err) {
        throw new genericError.OperationError(err.message || "Failed to assign issue");
    }
};
