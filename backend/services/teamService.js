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

    if (!team) {
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
