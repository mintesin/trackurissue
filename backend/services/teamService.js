import mongoose from 'mongoose';
import teamModel from '../models/teamModel.js';
import assignedIssueModel from '../models/assignedIssueModel.js';
import employeeModel from '../models/employeeModel.js';
import * as genericError from './genericError.js';

/**
 * Gets team dashboard data including team details, members, and assigned issues
 */
export const teamHome = async (teamId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(teamId)) {
      throw new genericError.BadRequestError('Invalid team ID format');
    }

  const [teamData, assignedIssuesData] = await Promise.all([
      teamModel.findById(teamId)
        .populate('company', 'companyName')
        .populate({
          path: 'members',
          select: 'firstName lastName authorization email',
          model: 'Employee'
        })
        .populate({
          path: 'teamLeaders',
          select: '_id firstName lastName authorization email',
          model: 'Employee'
        })
        .lean(),
      assignedIssueModel.find({ team: teamId })
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
        .lean()
    ]);

    console.log('Team data from DB:', {
      teamName: teamData.teamName,
      teamLeaders: teamData.teamLeaders?.map(l => ({
        id: l._id,
        name: `${l.firstName} ${l.lastName}`
      })),
      members: teamData.members?.map(m => ({
        id: m._id,
        name: `${m.firstName} ${m.lastName}`
      }))
    });

    if (!teamData) {
      throw new genericError.NotFoundError('Team not found');
    }

    // Transform members data to include isTeamLeader flag
    const teamLeaderIds = new Set(teamData.teamLeaders.map(leader => leader._id.toString()));
    
    const transformedTeam = {
      ...teamData,
      members: teamData.members?.map(member => ({
        _id: member._id,
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email,
        isTeamLeader: teamLeaderIds.has(member._id.toString())
      })) || []
    };

    // Remove the separate teamLeaders array since it's now merged with members
    delete transformedTeam.teamLeaders;
    console.log(transformedTeam)
    return {
      team: transformedTeam,
      issues: assignedIssuesData
    };
    
  } catch (err) {
    if (err instanceof genericError.NotFoundError || 
        err instanceof genericError.BadRequestError) {
      throw err;
    }
    throw new genericError.NotSuccessful("Fetching team data failed: " + err.message);
  }
};

/**
 * Gets team creation form fields
 */
export const getTeamCreationFields = async () => {
  return {
    fields: [
      { name: 'teamName', type: 'text', required: true, label: 'Team Name' },
      { name: 'description', type: 'textarea', required: false, label: 'Description' },
      { name: 'teamLeaders', type: 'select', required: false, label: 'Team Leaders (Optional)', multiple: true, description: 'You can assign team leaders later' }
    ]
  };
};

/**
 * Creates a new team
 */
export const teamCreate = async (teamData) => {
  try {
    const { teamName, description, teamLeaders, company } = teamData;

    if (!teamName || !company) {
      throw new genericError.BadRequestError('Team name and company are required');
    }

    const existingTeam = await teamModel.findOne({ teamName, company });
    if (existingTeam) {
      throw new genericError.ConflictError('Team name already exists for this company');
    }

    // Create team with or without leaders
    const newTeam = await teamModel.create({
      teamName,
      description,
      company,
      teamLeaders: teamLeaders || [],
      members: teamLeaders ? [...new Set(teamLeaders)] : []
    });

    // Update team leaders' roles if any are assigned
    if (teamLeaders && teamLeaders.length > 0) {
      await Promise.all(teamLeaders.map(async leaderId => {
        await employeeModel.findByIdAndUpdate(leaderId, {
          authorization: 'teamleader',
          $addToSet: { teams: newTeam._id, leadingTeams: newTeam._id }
        });
      }));
    }

    return newTeam;
  } catch (err) {
    throw err;
  }
};

/**
 * Gets team details for deletion confirmation
 */
export const getTeamToDelete = async (teamId) => {
  try {
    const team = await teamModel.findById(teamId)
      .populate('members', 'firstName lastName')
      .lean();

    if (!team) {
      throw new genericError.NotFoundError('Team not found');
    }

    return team;
  } catch (err) {
    throw err;
  }
};

/**
 * Deletes a team
 */
export const teamDelete = async (teamId) => {
  try {
    const team = await teamModel.findById(teamId);
    if (!team) {
      throw new genericError.NotFoundError('Team not found');
    }

    // Remove team references from members
    await employeeModel.updateMany(
      { teams: teamId },
      { $pull: { teams: teamId, leadingTeams: teamId } }
    );

    // Remove team from assigned issues
    await assignedIssueModel.updateMany(
      { team: teamId },
      { $unset: { team: 1 } }
    );

    await teamModel.findByIdAndDelete(teamId);
    return { message: 'Team deleted successfully' };
  } catch (err) {
    throw err;
  }
};

/**
 * Gets team members
 */
export const getTeamMembers = async (teamId) => {
  try {
    const team = await teamModel.findById(teamId)
      .populate({
        path: 'members',
        select: 'firstName lastName email authorization',
        model: 'Employee'
      })
      .populate({
        path: 'teamLeaders',
        select: '_id',
        model: 'Employee'
      })
      .lean();

    if (!team) {
      throw new genericError.NotFoundError('Team not found');
    }

    // Create a Set of team leader IDs for efficient lookup
    const teamLeaderIds = new Set(team.teamLeaders.map(leader => leader._id.toString()));

    // Map members and add isTeamLeader flag
    const members = team.members.map(member => ({
      _id: member._id,
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      isTeamLeader: teamLeaderIds.has(member._id.toString())
    }));

    console.log('Processed team members:', members);
    return members;
  } catch (err) {
    throw err;
  }
};

/**
 * Gets data for adding a member
 */
export const getAddMemberData = async (teamId) => {
  try {
    const team = await teamModel.findById(teamId).lean();
    if (!team) {
      throw new genericError.NotFoundError('Team not found');
    }

    const availableEmployees = await employeeModel.find({
      teams: { $ne: teamId }
    }).select('firstName lastName email').lean();

    return {
      team,
      availableEmployees
    };
  } catch (err) {
    throw err;
  }
};

/**
 * Adds a member to a team
 */
export const addMember = async (teamId, employeeId) => {
  try {
    const [team, employee] = await Promise.all([
      teamModel.findById(teamId),
      employeeModel.findById(employeeId)
    ]);

    if (!team) {
      throw new genericError.NotFoundError('Team not found');
    }

    if (!employee) {
      throw new genericError.NotFoundError('Employee not found');
    }

    if (team.members.includes(employeeId)) {
      throw new genericError.ConflictError('Employee is already a member of this team');
    }

    team.members.push(employeeId);
    await team.save();

    employee.teams = employee.teams || [];
    employee.teams.push(teamId);
    await employee.save();

    return { message: 'Member added successfully' };
  } catch (err) {
    throw err;
  }
};

/**
 * Gets data for removing a member
 */
export const getRemoveMemberData = async (teamId) => {
  try {
    const team = await teamModel.findById(teamId)
      .populate('members', 'firstName lastName email')
      .populate('teamLeaders', '_id')
      .lean();

    if (!team) {
      throw new genericError.NotFoundError('Team not found');
    }

    const teamLeaderIds = new Set(team.teamLeaders.map(leader => leader._id.toString()));
    const members = team.members.map(member => ({
      ...member,
      isTeamLeader: teamLeaderIds.has(member._id.toString())
    }));

    return {
      team: {
        ...team,
        members
      },
      members
    };
  } catch (err) {
    throw err;
  }
};

/**
 * Removes a member from a team
 */
export const removeMember = async (teamId, employeeId) => {
  try {
    const [team, employee] = await Promise.all([
      teamModel.findById(teamId),
      employeeModel.findById(employeeId)
    ]);

    if (!team) {
      throw new genericError.NotFoundError('Team not found');
    }

    if (!employee) {
      throw new genericError.NotFoundError('Employee not found');
    }

    if (!team.members.includes(employeeId)) {
      throw new genericError.NotFoundError('Employee is not a member of this team');
    }

    team.members = team.members.filter(id => id.toString() !== employeeId);
    await team.save();

    employee.teams = employee.teams.filter(id => id.toString() !== teamId);
    if (employee.authorization === 'teamleader') {
      employee.leadingTeams = employee.leadingTeams.filter(id => id.toString() !== teamId);
      if (employee.leadingTeams.length === 0) {
        employee.authorization = 'employee';
      }
    }
    await employee.save();

    return { message: 'Member removed successfully' };
  } catch (err) {
    throw err;
  }
};

/**
 * Assigns a leader to a team
 */
export const assignLeader = async (teamId, employeeId) => {
  try {
    const team = await teamModel.findById(teamId);
    if (!team) throw new genericError.NotFoundError('Team not found');

    // Add to teamLeaders if not already present
    if (!team.teamLeaders.map(id => id.toString()).includes(employeeId)) {
      team.teamLeaders.push(employeeId);
    }
    // Add to members if not already present
    if (!team.members.map(id => id.toString()).includes(employeeId)) {
      team.members.push(employeeId);
    }
    await team.save();

    // Update employee's authorization and leadingTeams
    const employee = await employeeModel.findById(employeeId);
    if (employee) {
      employee.authorization = 'teamleader';
      employee.leadingTeams = employee.leadingTeams || [];
      if (!employee.leadingTeams.map(id => id.toString()).includes(teamId)) {
        employee.leadingTeams.push(teamId);
      }
      if (!employee.teams.map(id => id.toString()).includes(teamId)) {
        employee.teams.push(teamId);
      }
      await employee.save();
    }

    // Return updated team with populated leaders and members
    const updatedTeam = await teamModel.findById(teamId)
      .populate('members', 'firstName lastName email authorization')
      .populate('teamLeaders', '_id firstName lastName email authorization')
      .lean();
    return updatedTeam;
  } catch (err) {
    throw err;
  }
};

export default {
  teamHome,
  getTeamCreationFields,
  teamCreate,
  getTeamToDelete,
  teamDelete,
  getTeamMembers,
  getAddMemberData,
  addMember,
  getRemoveMemberData,
  removeMember,
  assignLeader
};
