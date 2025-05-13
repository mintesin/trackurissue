import expressAsyncHandler from 'express-async-handler';
import * as employeeService from '../services/employeeService.js';
import * as genericError from '../services/genericError.js';

const asynchandler = expressAsyncHandler;

/**
 * GET /employee/login
 * Returns the login form fields (email and password)
 */
export const employeeLoginGet = asynchandler(async(req, res, next) => {
    try {
        const loginFields = employeeService.employeeLoginGet();
        res.status(200).json(loginFields);
    } catch (err) {
        next(err);
    }
});

/**
 * POST /employee/login
 * Authenticates employee credentials using secure password comparison
 */
export const employeeLoginPost = asynchandler(async(req, res, next) => {
    try {
        const { token, employee } = await employeeService.employeeLoginPost(req.body);
        
        // Set HTTP-Only cookie with JWT token
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        res.status(200).json({
            status: 'success',
            data: {
                employee
            }
        });
    } catch (err) {
        next(err);
    }
});

/**
 * GET /employee/reset
 * Returns password reset form fields
 */
export const resetAccountGet = asynchandler(async(req, res, next) => {
    try {
        const resetFields = employeeService.employeeResetAccountGet();
        res.status(200).json(resetFields);
    } catch (err) {
        next(err);
    }
});

/**
 * POST /employee/reset
 * Handles password reset with secure password update
 */
export const resetAccountpost = asynchandler(async(req, res, next) => {
    try {
        const { employeeEmail, favoriteWord, password } = req.body;

        if (!employeeEmail || !favoriteWord || !password) {
            throw new genericError.BadRequestError('Please provide all required fields');
        }

        const updatedEmployee = await employeeService.employeeResetAccountPost(req.body);
        
        res.status(200).json({
            status: 'success',
            message: 'Password reset successful',
            data: {
                employee: updatedEmployee
            }
        });
    } catch (err) {
        next(err);
    }
});

/**
 * GET /employee/profile/:id
 * Returns the profile information of a specific employee
 */
export const getEmployeeProfile = asynchandler(async(req, res, next) => {
    try {
        const employeeId = req.params.id;
        const employee = await employeeService.getEmployeeProfile(employeeId);
        
        res.status(200).json({
            status: 'success',
            data: {
                employee
            }
        });
    } catch (err) {
        next(err);
    }
});

/**
 * PUT /employee/profile/:id
 * Updates the profile information of a specific employee
 */
export const updateEmployeeProfile = asynchandler(async(req, res, next) => {
    try {
        const employeeId = req.params.id;
        
        // Check if the logged-in employee is updating their own profile
        if (req.employee._id.toString() !== employeeId) {
            throw new genericError.UnauthorizedError('You can only update your own profile');
        }

        const updatedEmployee = await employeeService.updateEmployeeProfile(employeeId, req.body);
        
        res.status(200).json({
            status: 'success',
            message: 'Profile updated successfully',
            data: {
                employee: updatedEmployee
            }
        });
    } catch (err) {
        next(err);
    }
});
