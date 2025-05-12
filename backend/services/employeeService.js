import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import employeeModel from '../models/employeeModel.js'
import teamModel from '../models/teamModel.js'
import * as genericError from './genericError.js'
import validator from 'validator'

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
 * Validate employee registration data
 * @param {Object} data - Employee registration data
 * @throws {Error} If validation fails
 */
const validateEmployeeData = (data) => {
    // Check for either email or employeeEmail field
    const emailToValidate = data.employeeEmail || data.email;
    if (!emailToValidate || !validator.isEmail(emailToValidate)) {
        throw new genericError.BadRequestError('Invalid email format');
    }
    // Normalize the email field
    data.employeeEmail = emailToValidate;
    
    if (!data.password || data.password.length < 8) {
        throw new genericError.BadRequestError('Password must be at least 8 characters long');
    }

    if (!data.company) {
        throw new genericError.BadRequestError('Company ID is required');
    }
};

/**
 * Register a new employee
 * @param {Object} employeeData - Employee registration data
 * @returns {Promise<Object>} Created employee instance and JWT token
 * @throws {Error} If registration fails
 */
export const registerEmployee = async (employeeData) => {
    try {
        // Validate input data
        validateEmployeeData(employeeData);

        // Check if email already exists
        const existingEmployee = await employeeModel.findOne({ employeeEmail: employeeData.employeeEmail });
        if (existingEmployee) {
            throw new genericError.ConflictError('Email already registered');
        }

        // Create new employee
        const employee = new employeeModel(employeeData);
        await employee.save();

        // Generate token
        const token = generateToken(employee._id);

        // Return employee data without sensitive information
        const employeeResponse = employee.toObject();
        delete employeeResponse.password;

        return {
            token,
            employee: employeeResponse
        };
    } catch (err) {
        if (err.code === 11000) { // MongoDB duplicate key error
            throw new genericError.ConflictError('Employee already exists');
        }
        if (err.name === 'BadRequestError' || err.name === 'ConflictError') {
            throw err;
        }
        throw new genericError.BadRequestError(err.message);
    }
};

/**
 * Gets employee dashboard data including employee details and team information
 * @param {string} employeeId - The ID of the employee
 * @returns {Promise<Object>} Object containing employee and team data
 * @throws {genericError.NotFoundError} If employee not found
 * @throws {genericError.OperationError} If data retrieval fails
 */
export const employeeDashboard = async (employeeId) => {
    try {
        const [employee, team] = await Promise.all([
            employeeModel.findById(employeeId)
                .select('firstName lastName employeeEmail authorization team')
                .lean(),
            teamModel.findOne({members: employeeId})
                .select('teamName teamAdmin')
                .lean()
        ]);
        
        if (!employee) {
            throw new genericError.NotFoundError('Employee not found');
        }

        return {
            employee,
            team: team || null
        };
    }
    catch (err) {
        if (err.name === 'NotFoundError') {
            throw err;
        }
        throw new genericError.OperationError('Failed to fetch employee dashboard: ' + err.message);
    }
}

/**
 * Gets default values for employee registration form
 * @returns {Object} Default employee registration data structure
 */
export const employeeRegisterGet = () => {
    const employeeDetail = {
        firstName: '',
        lastName: '',
        employeeEmail: '',
        streetNumber: '',
        city: '',
        state: '',
        zipcode: '',
        country: '',
        favoriteWord: '',
        password: '',
        company: ''
    };
    return {...employeeDetail};
}

/**
 * Authenticates an employee
 * @param {Object} employeecredentials - Login credentials (employeeEmail, password)
 * @returns {Promise<Object>} The authenticated employee
 * @throws {genericError.NotFoundError} If employee not registered
 * @throws {genericError.UnauthorizedError} If password doesn't match
 * @throws {genericError.OperationError} If login fails
 */
export const employeeLoginPost = async(employeecredentials) => {
    try {
        let employee = await employeeModel.findOne({employeeEmail: employeecredentials.employeeEmail})
        if (!employee) {
            throw new genericError.NotFoundError('Employee not registered');
        }

        if (employee.password === employeecredentials.password) {
            // Generate token
            const token = generateToken(employee._id);
            
            // Return employee data without sensitive information
            const employeeResponse = employee.toObject();
            delete employeeResponse.password;
            
            return {
                token,
                employee: employeeResponse
            };
        }
        
        throw new genericError.UnauthorizedError('Invalid credentials');
    } catch (err) {
        if (err.name === 'NotFoundError' || err.name === 'UnauthorizedError') {
            throw err;
        }
        throw new genericError.OperationError('Login failed: ' + err.message);
    }
}

/**
 * Gets default values for password reset form
 * @returns {Object} Default password reset data structure
 */
export const employeeResetAccountGet = () => {
    let recoveryCredentials = {
        favoriteWord: ' ',
        employeeEmail:'',
        password: ' '
    }
    return {...recoveryCredentials}
}

/**
 * Resets an employee's password
 * @param {Object} recoveryCredentials - Reset credentials (employeeEmail, favoriteWord, password)
 * @returns {Promise<Object>} The updated employee
 * @throws {genericError.NotFoundError} If employee not registered
 * @throws {genericError.OperationError} If password recovery fails
 */
export const employeeResetAccountPost = async(recoveryCredentials) => {
    try {
        let employee = await employeeModel.findOne({employeeEmail: recoveryCredentials.employeeEmail})
        if(!employee) {
            throw new genericError.NotFoundError("Employee not registered");
        }
        if(employee.favoriteWord === recoveryCredentials.favoriteWord) {
            employee.password = recoveryCredentials.password    
            await employee.save()
            return employee 
        }
        throw new genericError.UnauthorizedError('Invalid security word');
    }
    catch(err) {
        if (err.name === 'NotFoundError' || err.name === 'UnauthorizedError') {
            throw err;
        }
        throw new genericError.OperationError("Password recovery failed");
    }
}

/**
 * Gets employee data for deregistration
 * @param {string} id - Employee ID
 * @returns {Promise<Object>} The employee data
 * @throws {genericError.NotFoundError} If employee not found
 * @throws {genericError.OperationError} If data retrieval fails
 */
export const employeeDeregisterGet = async (id) => {
    try {
        const employee = await employeeModel.findById(id);
        if (!employee) {
            throw new genericError.NotFoundError('Employee not found');
        }
        return employee;
    }
    catch (err) {
        if (err.name === 'NotFoundError') {
            throw err;
        }
        throw new genericError.OperationError('Failed to fetch employee: ' + err.message);
    }
}

/**
 * Deregisters an employee
 * @param {string} id - Employee ID
 * @returns {Promise<Object>} Success message
 * @throws {genericError.NotFoundError} If employee not found
 * @throws {genericError.OperationError} If deregistration fails
 */
export const employeeDeregisterPost = async (id) => {
    try {
        const deletedEmployee = await employeeModel.findByIdAndDelete(id);
        if (!deletedEmployee) {
            throw new genericError.NotFoundError('Employee not found');
        }
        return { message: 'Employee deregistered successfully' };
    }
    catch (err) {
        if (err.name === 'NotFoundError') {
            throw err;
        }
        throw new genericError.OperationError('Deregistration failed: ' + err.message);
    }
}

/**
 * Handles employee logout
 * @returns {Object} Success message
 */
export const employeeLogout = () => {
    return { message: 'Logout successful' };
}
