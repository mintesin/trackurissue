/**
 * Authentication Middleware
 * Security features implemented:
 * 1. JWT-based authentication
 * 2. Rate limiting for login attempts
 * 3. Token verification and validation
 * 4. Proper error handling
 */

import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import * as genericError from '../services/genericError.js';
import companyModel from '../models/companyModel.js';

/**
 * Rate limiter for login attempts
 * Prevents brute force attacks by limiting login attempts
 * 5 attempts per 15 minutes per IP address
 */
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'test' ? 100 : 5, // Higher limit for tests
    message: 'Too many login attempts from this IP, please try again after 15 minutes',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    skip: (req) => {
        // Skip rate limiting in test environment, enable in production
        return process.env.NODE_ENV !== 'production';
    }
});

/**
 * JWT Authentication Middleware
 * Verifies the JWT token from Authorization header
 * Attaches the company object to the request if authenticated
 */
export const companyAuth = async (req, res, next) => {
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
            
            // 3. Check if company still exists
            const company = await companyModel
                .findById(decoded.id)
                .select('-password -passwordResetToken -passwordResetExpires');

            if (!company) {
                throw new genericError.UnauthorizedError('The company belonging to this token no longer exists');
            }

            // 4. Check if password was changed after token was issued
            if (company.passwordChangedAt && decoded.iat < company.passwordChangedAt.getTime() / 1000) {
                throw new genericError.UnauthorizedError('Password was recently changed. Please login again');
            }

            // 5. Grant access - attach company to request
            req.company = company;
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
 * Role-based Authorization Middleware
 * Restricts access based on company role/permissions
 * @param {...String} roles - Allowed roles for the route
 */
export const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.company.role)) {
            return next(new genericError.AuthorizationError('You do not have permission to perform this action'));
        }
        next();
    };
};

/**
 * API Rate Limiter
 * Prevents DoS attacks by limiting request rate
 * 100 requests per hour per IP
 */
export const apiLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: process.env.NODE_ENV === 'test' ? 1000 : 100, // Higher limit for tests
    message: 'Too many requests from this IP, please try again after an hour',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Skip rate limiting in test environment, enable in production
        return process.env.NODE_ENV !== 'production';
    }
});
