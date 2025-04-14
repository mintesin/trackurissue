import mongoose from 'mongoose'
import employeeModel from '../models/employeeModel.js'
import teamModel from '../models/teamModel.js'
import * as genericError from './genericError.js'

/**
 * Gets employee dashboard data including employee details and team information
 * @param {string} employeeId - The ID of the employee
 * @returns {Promise<Object>} Object containing employee and team data
 * @throws {genericError.notFoundError} If employee not found
 * @throws {genericError.NotSuccessFul} If data retrieval fails
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
            throw new genericError.notFoundError('Employee not found');
        }

        return {
            employee,
            team: team || null
        };
    }
    catch (err) {
        throw new genericError.NotSuccessFul('Failed to fetch employee dashboard: ' + err.message);
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
 * Registers a new employee
 * @param {Object} employeeData - Employee registration data
 * @returns {Promise<Object>} The created employee instance
 * @throws {Error} If registration fails
 */
export const employeeRegisterPost = async (employeeData) => {
    try {
        const employeeInstance = new employeeModel(employeeData);
        await employeeInstance.save();
        return employeeInstance;
    }
    catch (err) {
        throw new Error('Registration failed: ' + err.message);
    }
}

/**
 * Authenticates an employee
 * @param {Object} employeecredentials - Login credentials (employeeEmail, password)
 * @returns {Promise<Object>} The authenticated employee
 * @throws {genericError.notFoundError} If employee not registered
 * @throws {genericError.AuthorizationError} If password doesn't match
 * @throws {genericError.NotSuccessFul} If login fails
 */
export const employeeLoginPost = async(employeecredentials) => {
    try {
        let employee = await employeeModel.findOne({employeeEmail: employeecredentials.employeeEmail})
        if(!employee) {
            throw new genericError.notFoundError('Employee not registered')
        }
        if(employee.password === employeecredentials.password) {
            return employee
        }
        else {
            throw new genericError.AuthorizationError("Login failed")
        }
    }
    catch(err) {
        throw new genericError.NotSuccessFul('Login not successful: ' + err.message)
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
 * @throws {genericError.notFoundError} If employee not registered
 * @throws {genericError.NotSuccessFul} If password recovery fails
 */
export const employeeResetAccountPost = async(recoveryCredentials) => {
    try {
        let employee = await employeeModel.findOne({employeeEmail: recoveryCredentials.employeeEmail})
        if(!employee) {
            throw new genericError.notFoundError("employee not registered")
        }
        if(employee.favoriteWord === recoveryCredentials.favoriteWord) {
            employee.password = recoveryCredentials.password    
            await employee.save()
            return employee 
        }
    }
    catch(err) {
        throw new genericError.NotSuccessFul("password recovery not successful")
    }
}

/**
 * Gets employee data for deregistration
 * @param {string} id - Employee ID
 * @returns {Promise<Object>} The employee data
 * @throws {genericError.notFoundError} If employee not found
 * @throws {genericError.NotSuccessFul} If data retrieval fails
 */
export const employeeDeregisterGet = async (id) => {
    try {
        const employee = await employeeModel.findById(id);
        if (!employee) {
            throw new genericError.notFoundError('Employee not found');
        }
        return employee;
    }
    catch (err) {
        throw new genericError.NotSuccessFul('Failed to fetch employee: ' + err.message);
    }
}

/**
 * Deregisters an employee
 * @param {string} id - Employee ID
 * @returns {Promise<Object>} Success message
 * @throws {genericError.notFoundError} If employee not found
 * @throws {genericError.NotSuccessFul} If deregistration fails
 */
export const employeeDeregisterPost = async (id) => {
    try {
        const deletedEmployee = await employeeModel.findByIdAndDelete(id);
        if (!deletedEmployee) {
            throw new genericError.notFoundError('Employee not found');
        }
        return { message: 'Employee deregistered successfully' };
    }
    catch (err) {
        throw new genericError.NotSuccessFul('Deregistration failed: ' + err.message);
    }
}

/**
 * Handles employee logout
 * @returns {Object} Success message
 */
export const employeeLogout = () => {
    return { message: 'Logout successful' };
}

