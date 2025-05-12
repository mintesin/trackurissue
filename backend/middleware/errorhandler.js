/**
 * Error Handler Middleware
 * Security improvements implemented:
 * 1. Different error responses for development and production
 * 2. Sanitized error messages in production
 * 3. Proper handling of different error types
 * 4. Prevention of sensitive data leakage
 * 5. Standardized error response format
 */

import mongoose from 'mongoose';
import * as genericError from '../services/genericError.js';

/**
 * Handle Cast Error from Mongoose
 * @param {Error} err - Mongoose CastError
 * @returns {Error} Formatted error
 */
const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new genericError.BadRequestError(message);
};

/**
 * Handle Duplicate Fields Error from MongoDB
 * @param {Error} err - MongoDB duplicate key error
 * @returns {Error} Formatted error
 */
const handleDuplicateFieldsDB = (err) => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Duplicate field value: ${value}. Please use another value.`;
    return new genericError.ConflictError(message);
};

/**
 * Handle Validation Error from Mongoose
 * @param {Error} err - Mongoose ValidationError
 * @returns {Error} Formatted error
 */
const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new genericError.BadRequestError(message);
};

/**
 * Handle JWT Error
 * @returns {Error} Formatted error
 */
const handleJWTError = () => 
    new genericError.UnauthorizedError('Invalid token. Please log in again.');

/**
 * Handle JWT Expired Error
 * @returns {Error} Formatted error
 */
const handleJWTExpiredError = () => 
    new genericError.UnauthorizedError('Your token has expired. Please log in again.');

/**
 * Send Error Response in Development
 * Includes full error details for debugging
 */
const sendErrorDev = (err, res) => {
    res.status(err.statusCode || 500).json({
        status: 'error',
        error: err,
        message: err.message,
        stack: err.stack
    });
};

/**
 * Send Error Response in Production
 * Sanitized error response without sensitive details
 */
const sendErrorProd = (err, res) => {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: 'error',
            message: err.message
        });
    } 
    // Programming or other unknown error: don't leak error details
    else {
        // Log error for debugging
        console.error('ERROR 💥:', err);

        // Send generic message
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong!'
        });
    }
};

/**
 * Global Error Handler Middleware
 * Handles all errors in the application
 */
const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else {
        let error = { ...err };
        error.message = err.message;

        // Handle specific error types
        if (error instanceof mongoose.Error.CastError) error = handleCastErrorDB(error);
        if (error.code === 11000) error = handleDuplicateFieldsDB(error);
        if (error instanceof mongoose.Error.ValidationError) error = handleValidationErrorDB(error);
        if (error.name === 'JsonWebTokenError') error = handleJWTError();
        if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

        sendErrorProd(error, res);
    }
};

export default errorHandler;
