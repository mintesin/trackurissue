import expressAsyncHandler from 'express-async-handler';
import * as employeeService from '../services/employeeService.js';

const asynchandler = expressAsyncHandler;

/**
 * GET /employee/register
 * Returns the registration form fields required to create a new employee
 * Includes all fields from employee model as empty template
 */
export const employeeregisterGet = asynchandler(async(req, res, next) => {
    try {
        const registrationFields = employeeService.employeeRegisterGet();
        res.status(200).json(registrationFields);
    } catch (err) {
        next(err);
    }
});

/**
 * POST /employee/register
 * Creates a new employee record in database
 * Validates and processes registration form data
 * Returns the newly created employee object
 */
export const employeeregisterPost = asynchandler(async(req, res, next) => {
    try {
        const newEmployee = await employeeService.employeeRegisterPost(req.body);
        res.status(201).json(newEmployee);
    } catch (err) {
        next(err);
    }
});

/**
 * GET /employee/login
 * Returns the login form fields (email and password)
 * Used to initialize the login form on client side
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
 * Authenticates employee credentials
 * Validates email and password against database
 * Returns employee object if authentication succeeds
 */
export const employeeLoginPost = asynchandler(async(req, res, next) => {
    try {
        const employee = await employeeService.employeeLoginPost(req.body);
        res.status(200).json(employee);
    } catch (err) {
        next(err);
    }
});

/**
 * GET /employee/reset
 * Returns password reset form fields:
 * - Email
 * - Favorite word (security question)
 * - New password field
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
 * Handles password reset request
 * Verifies email and favorite word match
 * Updates password if verification succeeds
 * Returns updated employee object
 */
export const resetAccountpost = asynchandler(async(req, res, next) => {
    try {
        const updatedEmployee = await employeeService.employeeResetAccountPost(req.body);
        res.status(200).json(updatedEmployee);
    } catch (err) {
        next(err);
    }
});


