import mongoose from 'mongoose';
import Company from './companyModel.js';
import Employee from './employeeModel.js';
import Team from './teamModel.js';
import Sprint from './sprintModel.js';
import Milestone from './milestoneModel.js';

// Initialize models in the correct order (to handle dependencies)
const initializeModels = () => {
    // First, ensure any existing models are removed
    try {
        mongoose.deleteModel('Company');
    } catch (error) {
        // Model doesn't exist yet, which is fine
    }
    try {
        mongoose.deleteModel('Employee');
    } catch (error) {
        // Model doesn't exist yet, which is fine
    }
    try {
        mongoose.deleteModel('Team');
    } catch (error) {
        // Model doesn't exist yet, which is fine
    }
    try {
        mongoose.deleteModel('Sprint');
    } catch (error) {
        // Model doesn't exist yet, which is fine
    }
    try {
        mongoose.deleteModel('Milestone');
    } catch (error) {
        // Model doesn't exist yet, which is fine
    }

    // Then register models in the correct order
    const company = mongoose.model('Company', Company.schema);
    const employee = mongoose.model('Employee', Employee.schema);
    const team = mongoose.model('Team', Team.schema);
    const sprint = mongoose.model('Sprint', Sprint.schema);
    const milestone = mongoose.model('Milestone', Milestone.schema);

    console.log('Models initialized:', {
        Company: !!company,
        Employee: !!employee,
        Team: !!team,
        Sprint: !!sprint,
        Milestone: !!milestone
    });
};

export {
    Company,
    Employee,
    Team,
    Sprint,
    Milestone,
    initializeModels
};
