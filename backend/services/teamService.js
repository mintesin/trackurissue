import mongoose from 'mongoose'
import teamModel from '../models/teamModel.js'
import assignedIssueModel from '../models/assignedIssueModel.js'
import employeeModel from '../models/employeeModel.js' 
import * as genericError from './genericError.js'

/**
 * Gets team dashboard data including team details, members, and assigned issues
 * @param {string} teamId - The ID of the team
 * @returns {Promise<Object>} Object containing team, members, and issues data
 * @throws {genericError.notFoundError} If team not found
 * @throws {genericError.NotSuccessFul} If data retrieval fails
 */
export const teamHome = async (teamId) => {
  try {
    const [teamData, teamMembersData, assignedIssuesData] = await Promise.all([
      teamModel.findById(teamId) 
        .populate('company', 'companyName'),
      employeeModel.find({ team: teamId })
        .select('firstName lastName')
        .lean(),
      assignedIssueModel.find({ team: teamId })
        .select('topic description urgency assignedAt')
        .lean()
    ]);

    if (!teamData) {
      throw new genericError.notFoundError('Team not found');
    }
    
    return {
      team: teamData,
      members: teamMembersData,
      issues: assignedIssuesData
    };
    
  } catch (err) {
    throw new genericError.NotSuccessFul("Fetching team data not successful: " + err.message);
  }
};

/**
 * Creates a new team
 * @param {Object} teamData - Team creation data (teamName, teamAdmin, company)
 * @returns {Promise<Object>} The created team
 * @throws {genericError.BadRequestError} If required fields are missing
 * @throws {genericError.ConflictError} If team name already exists for company
 * @throws {Error} If team creation fails
 */
export const teamCreate = async (teamData) => {
  try {
    const { teamName, teamAdmin, company } = teamData;
    
    if (!teamName || !teamAdmin || !company) {
      throw new genericError.BadRequestError('Missing required fields');
    }

    const existingTeam = await teamModel.findOne({ 
      teamName,
      company 
    });
    
    if (existingTeam) {
      throw new genericError.ConflictError('Team name already exists for this company');
    }

    const newTeam = await teamModel.create({
      teamName,
      teamAdmin, 
      company
    });

    return newTeam;
  } catch (err) {
    throw err;
  }
}

/**
 * Deletes a team and removes all references to it
 * @param {string} teamId - The ID of the team to delete
 * @returns {Promise<Object>} Success message
 * @throws {genericError.notFoundError} If team not found
 * @throws {Error} If deletion fails
 */
export const teamDelete = async (teamId) => {
  try {
    const team = await teamModel.findById(teamId);
    if (!team) {
      throw new genericError.notFoundError('Team not found');
    }

    await employeeModel.updateMany(
      { team: teamId },
      { $unset: { team: 1 } }
    );

    await assignedIssueModel.updateMany(
      { team: teamId },
      { $unset: { team: 1 } }
    );

    await teamModel.findByIdAndDelete(teamId);
    return { message: 'Team deleted successfully' };
  } catch (err) {
    throw err;
  }
}

/**
 * Adds an employee to a team
 * @param {string} teamId - The ID of the team
 * @param {string} employeeId - The ID of the employee to add
 * @returns {Promise<Object>} Success message
 * @throws {genericError.notFoundError} If team or employee not found
 * @throws {genericError.ConflictError} If employee already in a team
 * @throws {Error} If operation fails
 */
export const addMember = async (teamId, employeeId) => {
  try {
    const team = await teamModel.findById(teamId);
    if (!team) {
      throw new genericError.notFoundError('Team not found');
    }

    const employee = await employeeModel.findById(employeeId);
    if (!employee) {
      throw new genericError.notFoundError('Employee not found');
    }

    if (employee.team) {
      throw new genericError.ConflictError('Employee already belongs to a team');
    }

    employee.team = teamId;
    await employee.save();

    return { message: 'Member added to team successfully' };
  } catch (err) {
    throw err;
  }
}

/**
 * Removes an employee from a team
 * @param {string} teamId - The ID of the team
 * @param {string} employeeId - The ID of the employee to remove
 * @returns {Promise<Object>} Success message
 * @throws {genericError.notFoundError} If team or employee not found in team
 * @throws {Error} If operation fails
 */
export const removeMember = async (teamId, employeeId) => {
  try {
    const team = await teamModel.findById(teamId);
    if (!team) {
      throw new genericError.notFoundError('Team not found');
    }

    const employee = await employeeModel.findOne({
      _id: employeeId,
      team: teamId
    });
    
    if (!employee) {
      throw new genericError.notFoundError('Employee not found in this team');
    }

    employee.team = undefined;
    await employee.save();

    return { message: 'Member removed from team successfully' };
  } catch (err) {
    throw err;
  }
}
