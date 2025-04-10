import mongoose from 'mongoose'
import teamModel from '../models/teamModel.js'
import assignedIssueModel from '../models/assignedIssueModel.js'
import employeeModel from '../models/employeeModel.js' 
import * as genericError from './genericError.js'

export const teamHome = async (teamId) => {
  try {
    const [teamData, teamMembersData, assignedIssuesData] = await Promise.all([
      teamModel.findById(teamId) 
        .populate('company', 'companyName'),
      employeeModel.find({ team: teamId }) // Find members in this team
        .select('firstName lastName')
        .lean(),
      assignedIssueModel.find({ team: teamId }) // Find issues assigned to team
        .select('topic description urgency assignedAt')
        .lean()
    ]);

    if (!teamData) {
      throw new genericError.notFoundError('Team not found');
    }
    
    return {
      team:teamData,
      members: teamMembersData,
      issues: assignedIssuesData
    };
    
  } catch (err) {
    throw new genericError.NotSuccessFul("Fetching company data not successful")
  }
};

export const teamCreate = async (teamData) => {
  try {
    const { teamName, teamAdmin, company } = teamData;
    
    // Validate required fields
    if (!teamName || !teamAdmin || !company) {
      throw new genericError.BadRequestError('Missing required fields');
    }

    // Check if team name already exists for this company
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
export const teamDelete = async (teamId) => {
  try {
    // Check if team exists
    const team = await teamModel.findById(teamId);
    if (!team) {
      throw new genericError.notFoundError('Team not found');
    }

    // Remove team reference from all members
    await employeeModel.updateMany(
      { team: teamId },
      { $unset: { team: 1 } }
    );

    // Remove team reference from all assigned issues
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
export const addMember = async (teamId, employeeId) => {
  try {
    // Check if team exists
    const team = await teamModel.findById(teamId);
    if (!team) {
      throw new genericError.notFoundError('Team not found');
    }

    // Check if employee exists
    const employee = await employeeModel.findById(employeeId);
    if (!employee) {
      throw new genericError.notFoundError('Employee not found');
    }

    // Check if employee already in a team
    if (employee.team) {
      throw new genericError.ConflictError('Employee already belongs to a team');
    }

    // Add to team
    employee.team = teamId;
    await employee.save();

    return { message: 'Member added to team successfully' };
  } catch (err) {
    throw err;
  }
}

export const removeMember = async (teamId, employeeId) => {
  try {
    // Check if team exists
    const team = await teamModel.findById(teamId);
    if (!team) {
      throw new genericError.notFoundError('Team not found');
    }

    // Check if employee exists and belongs to this team
    const employee = await employeeModel.findOne({
      _id: employeeId,
      team: teamId
    });
    
    if (!employee) {
      throw new genericError.notFoundError('Employee not found in this team');
    }

    // Remove from team
    employee.team = undefined;
    await employee.save();

    return { message: 'Member removed from team successfully' };
  } catch (err) {
    throw err;
  }
}
