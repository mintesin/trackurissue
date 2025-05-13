import jwt from 'jsonwebtoken';
import employeeModel from '../models/employeeModel.js';
import * as genericError from './genericError.js';
import validator from 'validator';

/**
 * Generate JWT Token for employee
 * @param {string} id - Employee ID
 * @returns {string} JWT token
 */
const generateToken = (id) => {
    return jwt.sign(
        { id },
        process.env.JWT_SECRET || 'test-secret-key',
        { expiresIn: '24h' }
    );
};

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

    // Validate each field
    Object.entries(validations).forEach(([field, validator]) => {
        try {
            const value = validator(data[field]);
            data[field] = value;
        } catch (error) {
            throw error;
        }
    });
};

/**
 * Gets default values for employee login form
 * @returns {Object} Default login form structure
 */
export const employeeLoginGet = () => {
    return {
        employeeEmail: '',
        password: ''
    };
};

/**
 * Authenticates an employee
 * @param {Object} employeecredentials - Login credentials
 * @returns {Promise<Object>} Authenticated employee and token
 */
export const employeeLoginPost = async(employeecredentials) => {
    try {
        validateEmployeeData(employeecredentials);

        const employee = await employeeModel.findOne({ employeeEmail: employeecredentials.employeeEmail })
            .select('+password');

        if (!employee) {
            throw new genericError.NotFoundError('Employee not registered');
        }

        // Use the secure password comparison method
        const isPasswordValid = await employee.comparePassword(employeecredentials.password);
        
        if (!isPasswordValid) {
            throw new genericError.UnauthorizedError('Invalid credentials');
        }

        // Generate token
        const token = generateToken(employee._id);
        
        // Remove sensitive data
        const employeeResponse = employee.toObject();
        delete employeeResponse.password;
        
        return {
            token,
            employee: employeeResponse
        };
    } catch (err) {
        if (err.name === 'NotFoundError' || err.name === 'UnauthorizedError') {
            throw err;
        }
        throw new genericError.OperationError('Login failed: ' + err.message);
    }
};

/**
 * Gets default values for password reset form
 * @returns {Object} Default reset form structure
 */
export const employeeResetAccountGet = () => {
    return {
        favoriteWord: '',
        employeeEmail: '',
        password: ''
    };
};

/**
 * Resets an employee's password
 * @param {Object} recoveryCredentials - Reset credentials
 * @returns {Promise<Object>} Updated employee
 */
export const employeeResetAccountPost = async(recoveryCredentials) => {
    try {
        const employee = await employeeModel.findOne({
            employeeEmail: recoveryCredentials.employeeEmail
        }).select('+password');

        if (!employee) {
            throw new genericError.NotFoundError("Employee not registered");
        }

        if (employee.favoriteWord === recoveryCredentials.favoriteWord) {
            // Validate new password
            if (!recoveryCredentials.password || recoveryCredentials.password.length < 8) {
                throw new genericError.BadRequestError('New password must be at least 8 characters long');
            }

            employee.password = recoveryCredentials.password;
            await employee.save();

            // Remove sensitive data before returning
            const employeeResponse = employee.toObject();
            delete employeeResponse.password;
            
            return employeeResponse;
        }
        throw new genericError.UnauthorizedError('Invalid security word');
    } catch (err) {
        if (err.name === 'NotFoundError' || err.name === 'UnauthorizedError' || err.name === 'BadRequestError') {
            throw err;
        }
        throw new genericError.OperationError("Password recovery failed");
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
        if (err.name === 'NotFoundError') {
            throw err;
        }
        throw new genericError.OperationError('Failed to fetch employee profile: ' + err.message);
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
        // Fields that are allowed to be updated
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

        // Filter out any fields that aren't allowed to be updated
        const filteredData = Object.keys(updateData)
            .filter(key => allowedUpdates.includes(key))
            .reduce((obj, key) => {
                obj[key] = updateData[key];
                return obj;
            }, {});

        const employee = await employeeModel.findById(employeeId);
        if (!employee) {
            throw new genericError.NotFoundError('Employee not found');
        }

        // Update allowed fields
        Object.assign(employee, filteredData);
        await employee.save();

        // Return employee without sensitive data
        const updatedEmployee = employee.toObject();
        delete updatedEmployee.password;
        delete updatedEmployee.passwordResetToken;
        delete updatedEmployee.passwordResetExpires;

        return updatedEmployee;
    } catch (err) {
        if (err.name === 'NotFoundError') {
            throw err;
        }
        throw new genericError.OperationError('Failed to update employee profile: ' + err.message);
    }
};
