import jwt from 'jsonwebtoken';
import { Employee } from '../models/index.js';
import Team from '../models/teamModel.js';
import * as genericError from './genericError.js';
import validator from 'validator';
import sendEmail from '../config/nodeMailer.js';


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

        // Verification successful, do not reset password here
        return {
            message: 'Verification successful. Please enter your new password.'
        };
    } catch (err) {
        handleError(err, ['NotFoundError', 'UnauthorizedError', 'BadRequestError']);
    }
};

export const employeeResetPasswordPost = async (resetData) => {
    try {
        const { employeeEmail, newPassword } = resetData;

        if (!employeeEmail || !newPassword) {
            throw new genericError.BadRequestError('Email and new password are required');
        }

        const employee = await Employee.findOne({ employeeEmail });

        if (!employee) {
            throw new genericError.NotFoundError('Employee not found');
        }

        // Update password
        employee.password = newPassword;
        await employee.save();

        // Send password reset notification email
        const emailSubject = 'Employee Account Password Reset';
        const emailText = `Hello ${employee.firstName} ${employee.lastName},\n\n` +
                         `Your password has been reset successfully.\n` +
                         `Your new temporary password is: ${newPassword}\n\n` +
                         `Please log in and change your password as soon as possible for security purposes.\n\n` +
                         `Best regards,\nCompany HR`;

        try {
            await sendEmail(employee.employeeEmail, emailSubject, emailText);
            console.log('Password reset email sent successfully to', employee.employeeEmail);
        } catch (emailError) {
            console.error('Failed to send password reset email:', emailError);
        }

        return {
            message: 'Password updated successfully'
        };
    } catch (err) {
        handleError(err, ['NotFoundError', 'BadRequestError']);
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
                sectionName: 'team',
                sectionTitle: 'Team Information',
                fields: [
                    {
                        name: 'teamId',
                        label: 'Team',
                        type: 'select',
                        required: false,
                        description: 'Optional: Select a team to assign this employee to'
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
        const allowedUpdates = [
            'firstName', 'lastName', 'streetNumber', 'city', 'state', 'zipcode', 'country',
            'avatar', 'notificationPreferences'
        ];
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
        const requiredFields = ['firstName', 'lastName', 'employeeEmail', 'company', 'streetNumber', 'city', 'state', 'zipcode', 'country', 'favoriteWord', 'birthDate'];
        for (const field of requiredFields) {
            if (!employeeData[field]) {
                throw new genericError.BadRequestError(`${field} is required`);
            }
        }

        // Map email to employeeEmail
        const employeeEmail = employeeData.employeeEmail;
        
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
            team: employeeData.teamId || null,
            teams: employeeData.teamId ? [employeeData.teamId] : [], // Add to teams array only if team is assigned
            authorization: employeeData.isTeamLeader ? 'teamleader' : 'employee'
        });

        // If employee is a team leader and has a team, add to leadingTeams
        if (employeeData.isTeamLeader && employeeData.teamId) {
            employee.leadingTeams = [employeeData.teamId];
        }

        await employee.save();  // Password will be hashed here by the pre-save middleware

        // Update the team's members array to include this employee (only if team is assigned)
        if (employeeData.teamId) {
            await Team.findByIdAndUpdate(employeeData.teamId, {
                $addToSet: { members: employee._id }
            });
        }

        // Get company and team details for the email and response
        const populatedEmployee = await Employee.findById(employee._id)
            .populate('company')
            .populate('team')
            .populate('teams')
            .populate('leadingTeams');

        // Send registration email with temporary password and team leader notification
        const emailSubject = 'Welcome to the Company - Your Account Details';
        let emailText = `Hello ${employee.firstName} ${employee.lastName},\n\n` +
                        `You have been registered as an employee of ${populatedEmployee.company.companyName}.\n`;

        if (populatedEmployee.team) {
            emailText += `You have been assigned to the team: ${populatedEmployee.team.teamName}\n`;
        } else {
            emailText += `You have not been assigned to a team yet. Your manager will assign you to a team soon.\n`;
        }

        emailText += `Your temporary password is: ${password}\n\n`;

        if (employeeData.isTeamLeader) {
            emailText += 'You have been assigned as a Team Leader.\n\n';
        }

        emailText += 'Please log in and change your password as soon as possible.\n\n' +
                     'Best regards,\nCompany HR';

        try {
            await sendEmail(employeeEmail, emailSubject, emailText);
            console.log('Registration email sent successfully to', employeeEmail);
        } catch (emailError) {
            console.error('Failed to send registration email:', emailError);
        }

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
