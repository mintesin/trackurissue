import mongoose from 'mongoose';
import Company from './companyModel.js';
import Employee from './employeeModel.js';
import Team from './teamModel.js';

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

    // Then register models in the correct order
    const company = mongoose.model('Company', Company.schema);
    const employee = mongoose.model('Employee', Employee.schema);
    const team = mongoose.model('Team', Team.schema);

    console.log('Models initialized:', {
        Company: !!company,
        Employee: !!employee,
        Team: !!team
    });
};

export {
    Company,
    Employee,
    Team,
    initializeModels
};
