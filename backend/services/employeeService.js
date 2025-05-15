
import jwt from 'jsonwebtoken';
import employeeModel from '../models/employeeModel.js';
import teamModel from '../models/teamModel.js';
import * as genericError from './genericError.js';
import validator from 'validator';

const handleError = (err, knownErrors = []) => {
    if (knownErrors.includes(err.name)) {
        throw err;
    }
    throw new genericError.OperationError(err.message || 'Operation failed');
};

const filterAllowedFields = (data, allowedFields) => {
    return Object.keys(data)
        .filter(key => allowedFields.includes(key))
        .reduce((obj, key) => {
            obj[key] = data[key];
            return obj;
        }, {});
};

/**
 * Gets the employee registration form fields structure
 * @returns {Object} Registration form fields structure
 */
export const getEmployeeRegistrationFields = () => ({
    sections: [
        {
            sectionName: 'personal',
            sectionTitle: 'Personal Information',
            fields: [
                { name: 'firstName', label: 'First Name', type: 'text', required: true, value: '' },
                { name: 'lastName', label: 'Last Name', type: 'text', required: true, value: '' },
                { name: 'email', label: 'Email', type: 'email', required: true, value: '' },
                { name: 'birthDate', label: 'Birth Date', type: 'date', required: true, value: '' }
            ]
        },
        {
            sectionName: 'address',
            sectionTitle: 'Address',
            fields: [
                { name: 'streetNumber', label: 'Street Address', type: 'text', required: true, value: '' },
                { name: 'city', label: 'City', type: 'text', required: true, value: '' },
                { name: 'state', label: 'State', type: 'text', required: true, value: '' },
                { name: 'zipcode', label: 'ZIP Code', type: 'text', required: true, value: '' },
                { name: 'country', label: 'Country', type: 'text', required: true, value: '' }
            ]
        },
        {
            sectionName: 'security',
            sectionTitle: 'Security Information',
            fields: [
                {
                    name: 'favoriteWord',
                    label: 'Security Word (for password recovery)',
                    type: 'text',
                    required: true,
                    value: '',
                    description: 'This word will be used to recover your password if needed'
                },
                {
                    name: 'password',
                    label: 'Password',
                    type: 'password',
                    required: true,
                    value: '',
                    description: 'Must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number, and 1 special character'
                },
                { name: 'isTeamLeader', label: 'Assign as Team Leader', type: 'checkbox', required: false, value: false }
            ]
        }
    ]
});

/**
 * Register a new employee
 * @param {Object} employeeData - Employee registration data
 * @returns {Promise<Object>} Newly created employee
 */
export const registerEmployee = async (employeeData) => {
    try {
        const requiredFields = ['firstName', 'lastName', 'email', 'teamId', 'company', 'streetNumber', 'city', 'state', 'zipcode', 'country', 'favoriteWord', 'birthDate'];
        for (const field of requiredFields) {
            if (!employeeData[field]) {
                throw new genericError.BadRequestError(`${field} is required`);
            }
        }

        const existingEmployee = await employeeModel.findOne({ 
            employeeEmail: employeeData.email,
            company: employeeData.company
        });
        if (existingEmployee) {
            throw new genericError.ConflictError('Email already registered for this company');
        }

        // Generate random password
        const password = Math.random().toString(36).slice(-8);

        const employee = new employeeModel({
            ...employeeData,
            employeeEmail: employeeData.email, // Map email to employeeEmail
            password,
            birthDate: new Date(employeeData.birthDate),
            team: employeeData.teamId, // Map teamId to team field
            authorization: employeeData.isTeamLeader ? 'teamleader' : 'employee' // Set authorization based on isTeamLeader
        });

        await employee.save();

        // TODO: Send email to employee with their credentials

        const employeeResponse = employee.toObject();
        delete employeeResponse.password;

        return employeeResponse;
    } catch (err) {
        if (err.name === 'ValidationError') {
            throw new genericError.BadRequestError(err.message);
        }
        throw err;
    }
};

/**
 * Generate JWT Token for employee
 * @param {string} id - Employee ID
 * @returns {string} JWT token
 */
const generateToken = (id) => jwt.sign(
    { id },
    process.env.JWT_SECRET || 'test-secret-key',
    { expiresIn: '24h' }
);

/**
 * Validate employee data
 * @param {Object} data - Employee data
 * @throws {Error} If validation fails
 */
const validateEmployeeData = (data) => {
    if (!data || typeof data !== 'object') {
        throw new genericError.BadRequestError('Valid employee data object is required');
    }

    const validations = {
        employeeEmail: (value) => {
            const email = value || data.email;
            if (!email || !validator.isEmail(email)) {
                throw new genericError.BadRequestError('Invalid email format');
            }
            return email;
        },
        password: (value) => {
            if (!value || value.length < 8) {
                throw new genericError.BadRequestError('Password must be at least 8 characters long');
            }
            return value;
        }
    };

    Object.entries(validations).forEach(([field, validator]) => {
        const value = validator(data[field]);
        data[field] = value;
    });
};

/**
 * Gets default values for employee login form
 * @returns {Object} Default login form structure
 */
export const employeeLoginGet = () => ({
    employeeEmail: '',
    password: ''
});

/**
 * Authenticates an employee
 * @param {Object} employeecredentials - Login credentials
 * @returns {Promise<Object>} Authenticated employee and token
 */
export const employeeLoginPost = async (employeecredentials) => {
    try {
        validateEmployeeData(employeecredentials);

        const employee = await employeeModel.findOne({ employeeEmail: employeecredentials.employeeEmail })
            .select('+password');

        if (!employee) {
            throw new genericError.NotFoundError('Employee not registered');
        }

        const isPasswordValid = await employee.comparePassword(employeecredentials.password);

        if (!isPasswordValid) {
            throw new genericError.UnauthorizedError('Invalid credentials');
        }

        const token = generateToken(employee._id);

        const employeeResponse = employee.toObject();
        delete employeeResponse.password;

        return {
            token,
            employee: employeeResponse
        };
    } catch (err) {
        handleError(err, ['NotFoundError', 'UnauthorizedError']);
    }
};

/**
 * Gets default values for password reset form
 * @returns {Object} Default reset form structure
 */
export const employeeResetAccountGet = () => ({
    favoriteWord: '',
    employeeEmail: '',
    password: ''
});

/**
 * Resets an employee's password
 * @param {Object} recoveryCredentials - Reset credentials
 * @returns {Promise<Object>} Updated employee
 */
export const employeeResetAccountPost = async (recoveryCredentials) => {
    try {
        const employee = await employeeModel.findOne({
            employeeEmail: recoveryCredentials.employeeEmail
        }).select('+password +favoriteWord');

        if (!employee) {
            throw new genericError.NotFoundError("Employee not registered");
        }

        const isValidWord = await employee.compareFavoriteWord(recoveryCredentials.favoriteWord);
        if (isValidWord) {
            if (!recoveryCredentials.password || recoveryCredentials.password.length < 8) {
                throw new genericError.BadRequestError('New password must be at least 8 characters long');
            }

            employee.password = recoveryCredentials.password;
            await employee.save();

            const employeeResponse = employee.toObject();
            delete employeeResponse.password;

            return employeeResponse;
        }
        throw new genericError.UnauthorizedError('Invalid security word');
    } catch (err) {
        handleError(err, ['NotFoundError', 'UnauthorizedError', 'BadRequestError']);
    }
};

/**
 * Gets employee profile information
 * @param {string} employeeId - The ID of the employee
 * @returns {Promise<Object>} Employee profile data
 */
export const getEmployeeProfile = async (employeeId) => {
    try {
        const employee = await employeeModel.findById(employeeId)
            .select('-password -passwordResetToken -passwordResetExpires')
            .lean();

        if (!employee) {
            throw new genericError.NotFoundError('Employee not found');
        }

        return employee;
    } catch (err) {
        handleError(err, ['NotFoundError']);
    }
};

/**
 * Updates employee profile information
 * @param {string} employeeId - The ID of the employee
 * @param {Object} updateData - The data to update
 * @returns {Promise<Object>} Updated employee profile
 */
export const updateEmployeeProfile = async (employeeId, updateData) => {
    try {
        const allowedUpdates = [
            'firstName',
            'lastName',
            'streetNumber',
            'city',
            'state',
            'zipcode',
            'country',
            'favoriteWord'
        ];

        const filteredData = filterAllowedFields(updateData, allowedUpdates);

        const employee = await employeeModel.findById(employeeId);
        if (!employee) {
            throw new genericError.NotFoundError('Employee not found');
        }

        Object.assign(employee, filteredData);
        await employee.save();

        const updatedEmployee = employee.toObject();
        delete updatedEmployee.password;
        delete updatedEmployee.passwordResetToken;
        delete updatedEmployee.passwordResetExpires;

        return updatedEmployee;
    } catch (err) {
        handleError(err, ['NotFoundError']);
    }
};

/**
 * Deregisters/removes an employee from the system
 * @param {string} employeeId - The ID of the employee to remove
 * @param {string} companyId - The ID of the company (for verification)
 * @returns {Promise<Object>} Success message
 * @throws {Error} If employee not found or removal fails
 */
export const deregisterEmployee = async (employeeId, companyId) => {
    try {
        const employee = await employeeModel.findOne({
            _id: employeeId,
            company: companyId
        });

        if (!employee) {
            throw new genericError.NotFoundError('Employee not found');
        }

        await teamModel.updateMany(
            { 'members': employeeId },
            { $pull: { members: employeeId } }
        );

        await employeeModel.findByIdAndDelete(employeeId);

        return {
            status: 'success',
            message: 'Employee deregistered successfully'
        };
    } catch (err) {
        handleError(err, ['NotFoundError']);
    }
};
