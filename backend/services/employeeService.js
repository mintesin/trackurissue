import jwt from 'jsonwebtoken';
import { Employee } from '../models/index.js';
import Team from '../models/teamModel.js';
import * as genericError from './genericError.js';
import validator from 'validator';

const handleError = (err, knownErrors = []) => {
    if (knownErrors.includes(err.name)) {
        throw err;
    }
    throw new genericError.OperationError(err.message || 'Operation failed');
};

const validateEmployeeData = (data) => {
    if (!data || typeof data !== 'object') {
        throw new genericError.BadRequestError('Valid employee data object is required');
    }

    const validations = {
        employeeEmail: (value) => {
            if (!value || !validator.isEmail(value)) {
                throw new genericError.BadRequestError('Invalid email format');
            }
            return value;
        },
        password: (value) => {
            if (!value || value.length < 8) {
                throw new genericError.BadRequestError('Password must be at least 8 characters long');
            }
            return value;
        }
    };

    // Ensure required fields exist
    if (!data.employeeEmail && !data.email) {
        throw new genericError.BadRequestError('Email is required');
    }

    // Map email to employeeEmail if needed
    if (!data.employeeEmail && data.email) {
        data.employeeEmail = data.email;
    }

    // Validate all fields
    Object.entries(validations).forEach(([field, validatorFn]) => {
        if (field === 'employeeEmail' || data[field]) {
            const value = validatorFn(data[field]);
            data[field] = value;
        }
    });
};

const generateToken = (id) => jwt.sign(
    { id },
    process.env.JWT_SECRET || 'test-secret-key',
    { expiresIn: '24h' }
);

export const employeeLoginGet = () => {
    return {
        fields: [
            {
                name: 'employeeEmail',
                label: 'Email',
                type: 'email',
                required: true
            },
            {
                name: 'password',
                label: 'Password',
                type: 'password',
                required: true
            }
        ]
    };
};

export const employeeLoginPost = async (employeecredentials) => {
    try {
        console.log('Login attempt for:', employeecredentials.employeeEmail);
        validateEmployeeData(employeecredentials);

        // Find employee with company context
        const employee = await Employee.findOne({ 
            employeeEmail: employeecredentials.employeeEmail 
        })
        .select('+password')
        .populate('company')
        .populate('team')
        .populate('teams')
        .populate('leadingTeams');

        if (!employee) {
            console.log('Employee not found');
            throw new genericError.NotFoundError('Employee not registered');
        }

        console.log('Found employee:', {
            id: employee._id,
            email: employee.employeeEmail,
            hasPassword: !!employee.password,
            team: employee.team?._id,
            teamsCount: employee.teams?.length || 0,
            leadingTeamsCount: employee.leadingTeams?.length || 0
        });

        const isPasswordValid = await employee.comparePassword(employeecredentials.password);
        console.log('Password validation result:', isPasswordValid);

        if (!isPasswordValid) {
            throw new genericError.UnauthorizedError('Invalid credentials');
        }

        const token = generateToken(employee._id);

        const employeeResponse = employee.toObject();
        delete employeeResponse.password;

        const { company, team, teams, leadingTeams } = employeeResponse;
        delete employeeResponse.company;

        // Ensure team is included in teams array if it exists
        const allTeams = teams || [];
        if (team && !allTeams.some(t => t._id.toString() === team._id.toString())) {
            allTeams.push(team);
        }

        return {
            token,
            employee: {
                ...employeeResponse,
                team: team?._id,
                teams: allTeams.map(t => t._id) || [],
                leadingTeams: leadingTeams?.map(t => t._id) || []
            },
            company,
            team,
            teams: allTeams,
            leadingTeams
        };
    } catch (err) {
        console.error('Login error:', err);
        handleError(err, ['NotFoundError', 'UnauthorizedError', 'BadRequestError']);
    }
};

export const employeeResetAccountGet = () => {
    return {
        fields: [
            {
                name: 'employeeEmail',
                label: 'Email',
                type: 'email',
                required: true
            },
            {
                name: 'favoriteWord',
                label: 'Security Word',
                type: 'text',
                required: true
            }
        ]
    };
};

export const employeeResetAccountPost = async (resetData) => {
    try {
        const { employeeEmail, favoriteWord } = resetData;

        if (!employeeEmail || !favoriteWord) {
            throw new genericError.BadRequestError('Email and security word are required');
        }

        const employee = await Employee.findOne({ employeeEmail });

        if (!employee) {
            throw new genericError.NotFoundError('Employee not found');
        }

        if (employee.favoriteWord !== favoriteWord) {
            throw new genericError.UnauthorizedError('Invalid security word');
        }

        // Generate new password
        const newPassword = Math.random().toString(36).slice(-8);
        employee.password = newPassword;
        await employee.save();

        return {
            message: 'Password reset successful',
            newPassword
        };
    } catch (err) {
        handleError(err, ['NotFoundError', 'UnauthorizedError', 'BadRequestError']);
    }
};

export const getEmployeeRegistrationFields = () => {
    return {
        sections: [
            {
                sectionName: 'personal',
                sectionTitle: 'Personal Information',
                fields: [
                    {
                        name: 'firstName',
                        label: 'First Name',
                        type: 'text',
                        required: true
                    },
                    {
                        name: 'lastName',
                        label: 'Last Name',
                        type: 'text',
                        required: true
                    },
                    {
                        name: 'email',
                        label: 'Email',
                        type: 'email',
                        required: true
                    },
                    {
                        name: 'birthDate',
                        label: 'Birth Date',
                        type: 'date',
                        required: true
                    }
                ]
            },
            {
                sectionName: 'address',
                sectionTitle: 'Address Information',
                fields: [
                    {
                        name: 'streetNumber',
                        label: 'Street Address',
                        type: 'text',
                        required: true
                    },
                    {
                        name: 'city',
                        label: 'City',
                        type: 'text',
                        required: true
                    },
                    {
                        name: 'state',
                        label: 'State',
                        type: 'text',
                        required: true
                    },
                    {
                        name: 'zipcode',
                        label: 'Zipcode',
                        type: 'text',
                        required: true
                    },
                    {
                        name: 'country',
                        label: 'Country',
                        type: 'text',
                        required: true
                    }
                ]
            },
            {
                sectionName: 'security',
                sectionTitle: 'Security Information',
                fields: [
                    {
                        name: 'favoriteWord',
                        label: 'Security Word',
                        type: 'text',
                        required: true,
                        description: 'This word will be used for password recovery'
                    }
                ]
            }
        ]
    };
};

export const getEmployeeProfile = async (employeeId) => {
    try {
        const employee = await Employee.findById(employeeId)
            .populate('team')
            .populate('teams')
            .populate('leadingTeams');

        if (!employee) {
            throw new genericError.NotFoundError('Employee not found');
        }

        const employeeData = employee.toObject();
        delete employeeData.password;
        return employeeData;
    } catch (err) {
        handleError(err, ['NotFoundError']);
    }
};

export const updateEmployeeProfile = async (employeeId, updateData) => {
    try {
        // Validate update data
        const allowedUpdates = ['firstName', 'lastName', 'streetNumber', 'city', 'state', 'zipcode', 'country'];
        const updates = Object.keys(updateData)
            .filter(key => allowedUpdates.includes(key))
            .reduce((obj, key) => {
                obj[key] = updateData[key];
                return obj;
            }, {});

        const employee = await Employee.findByIdAndUpdate(
            employeeId,
            updates,
            { new: true, runValidators: true }
        ).populate('team')
         .populate('teams')
         .populate('leadingTeams');

        if (!employee) {
            throw new genericError.NotFoundError('Employee not found');
        }

        const employeeData = employee.toObject();
        delete employeeData.password;
        return employeeData;
    } catch (err) {
        handleError(err, ['NotFoundError', 'ValidationError']);
    }
};

export const registerEmployee = async (employeeData) => {
    try {
        const requiredFields = ['firstName', 'lastName', 'email', 'teamId', 'company', 'streetNumber', 'city', 'state', 'zipcode', 'country', 'favoriteWord', 'birthDate'];
        for (const field of requiredFields) {
            if (!employeeData[field]) {
                throw new genericError.BadRequestError(`${field} is required`);
            }
        }

        // Map email to employeeEmail
        const employeeEmail = employeeData.employeeEmail || employeeData.email;
        
        const existingEmployee = await Employee.findOne({ 
            employeeEmail,
            company: employeeData.company
        });
        if (existingEmployee) {
            throw new genericError.ConflictError('Email already registered for this company');
        }

        // Generate a random password
        const password = Math.random().toString(36).slice(-8);
        console.log('Backend - Password Generation:');
        console.log('- Generated plain password:', password);
        console.log('- Employee email:', employeeEmail);

        // Create employee with plain password - the model's pre-save middleware will hash it
        const employee = new Employee({
            ...employeeData,
            employeeEmail,
            password,  // Plain password - will be hashed by pre-save middleware
            birthDate: new Date(employeeData.birthDate),
            team: employeeData.teamId,
            teams: [employeeData.teamId], // Add to teams array as well
            authorization: employeeData.isTeamLeader ? 'teamleader' : 'employee'
        });

        // If employee is a team leader, add to leadingTeams
        if (employeeData.isTeamLeader) {
            employee.leadingTeams = [employeeData.teamId];
        }

        await employee.save();  // Password will be hashed here by the pre-save middleware

        // Populate team information before returning
        const populatedEmployee = await Employee.findById(employee._id)
            .populate('team')
            .populate('teams')
            .populate('leadingTeams');

        const employeeResponse = populatedEmployee.toObject();
        delete employeeResponse.password;

        // Return both the employee data and the plain text password
        return {
            ...employeeResponse,
            generatedPassword: password  // Include the plain text password in the response
        };
    } catch (err) {
        if (err.name === 'ValidationError') {
            throw new genericError.BadRequestError(err.message);
        }
        throw err;
    }
};

export const deregisterEmployee = async (employeeId, companyId) => {
    try {
        const employee = await Employee.findOne({ _id: employeeId, company: companyId });
        if (!employee) {
            throw new genericError.NotFoundError('Employee not found');
        }

        // Remove employee from all teams
        await Team.updateMany(
            { members: employeeId },
            { $pull: { members: employeeId } }
        );

        await Employee.findByIdAndDelete(employeeId);
        return { message: 'Employee deregistered successfully' };
    } catch (err) {
        handleError(err, ['NotFoundError']);
    }
};

export default {
    employeeLoginGet,
    employeeLoginPost,
    employeeResetAccountGet,
    employeeResetAccountPost,
    getEmployeeRegistrationFields,
    getEmployeeProfile,
    updateEmployeeProfile,
    registerEmployee,
    deregisterEmployee
};
