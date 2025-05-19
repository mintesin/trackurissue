import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import * as genericError from '../services/genericError.js';
import employeeModel from '../models/employeeModel.js';

/**
 * Rate limiter for employee login attempts
 * Prevents brute force attacks by limiting login attempts
 * 5 attempts per 15 minutes per IP address
 */
export const employeeLoginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'test' ? 100 : 5,
    message: 'Too many login attempts from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => process.env.NODE_ENV !== 'production'
});

/**
 * JWT Authentication Middleware for Employees
 * Verifies the JWT token from Authorization header
 * Attaches the employee object to the request if authenticated
 */
export const employeeAuth = async (req, res, next) => {
    try {
        // 1. Get token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new genericError.UnauthorizedError('Please login to access this resource');
        }

        const token = authHeader.split(' ')[1];

        // 2. Verify token
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // 3. Check if employee still exists and populate team data
            const employee = await employeeModel
                .findById(decoded.id)
                .select('+password') // Explicitly include password for comparison
                .populate('team') // Populate single team reference
                .populate('teams') // Populate teams array
                .populate('leadingTeams'); // Populate teams they lead

            if (!employee) {
                throw new genericError.UnauthorizedError('The employee belonging to this token no longer exists');
            }

            // 4. Check if password was changed after token was issued
            if (employee.changedPasswordAfter(decoded.iat)) {
                throw new genericError.UnauthorizedError('Password was recently changed. Please login again');
            }

            // 5. Remove password from employee object
            employee.password = undefined;

            // 6. Grant access - attach employee to request
            req.employee = employee;
            next();
        } catch (err) {
            if (err.name === 'JsonWebTokenError') {
                throw new genericError.UnauthorizedError('Invalid token. Please login again');
            }
            if (err.name === 'TokenExpiredError') {
                throw new genericError.UnauthorizedError('Your token has expired. Please login again');
            }
            throw err;
        }
    } catch (error) {
        next(error);
    }
};

/**
 * Role-based Authorization Middleware for Employees
 * Restricts access based on employee authorization level
 * @param {...String} roles - Allowed roles for the route
 */
export const restrictToEmployee = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.employee.authorization)) {
            return next(new genericError.AuthorizationError('You do not have permission to perform this action'));
        }
        next();
    };
};

/**
 * API Rate Limiter for Employee Routes
 * Prevents DoS attacks by limiting request rate
 * 100 requests per hour per IP
 */
export const employeeApiLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: process.env.NODE_ENV === 'test' ? 1000 : 100,
    message: 'Too many requests from this IP, please try again after an hour',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => process.env.NODE_ENV !== 'production'
});
