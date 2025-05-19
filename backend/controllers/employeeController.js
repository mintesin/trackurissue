import expressAsyncHandler from 'express-async-handler';
import * as employeeService from '../services/employeeService.js';
import { Employee } from '../models/index.js';

/**
 * GET /employee/login
 * Returns login form template
 */
export const loginEmployeeGet = expressAsyncHandler(async (req, res, next) => {
    const loginFields = employeeService.employeeLoginGet();
    res.status(200).json(loginFields);
});

/**
 * POST /employee/login
 * Authenticates employee and returns JWT token
 */
export const loginEmployeePost = expressAsyncHandler(async (req, res, next) => {
    const loginResponse = await employeeService.employeeLoginPost(req.body);
    res.status(200).json(loginResponse);
});

/**
 * GET /employee/reset
 * Returns password reset form template
 */
export const resetAccountGet = expressAsyncHandler(async (req, res, next) => {
    const resetFields = employeeService.employeeResetAccountGet();
    res.status(200).json(resetFields);
});

/**
 * POST /employee/reset
 * Handles password reset
 */
export const resetAccountPost = expressAsyncHandler(async (req, res, next) => {
    const updatedEmployee = await employeeService.employeeResetAccountPost(req.body);
    res.status(200).json(updatedEmployee);
});

/**
 * GET /employee/profile/:id
 * Get employee profile
 */
export const getProfile = expressAsyncHandler(async (req, res, next) => {
    const profile = await employeeService.getEmployeeProfile(req.params.id);
    res.status(200).json(profile);
});

/**
 * PUT /employee/profile/:id
 * Update employee profile
 */
export const updateProfile = expressAsyncHandler(async (req, res, next) => {
    const updatedProfile = await employeeService.updateEmployeeProfile(req.params.id, req.body);
    res.status(200).json(updatedProfile);
});

/**
 * GET /admin/employee/register
 * Returns registration form template
 */
export const getEmployeeRegistrationFields = expressAsyncHandler(async (req, res, next) => {
    const fields = employeeService.getEmployeeRegistrationFields();
    res.status(200).json(fields);
});

/**
 * POST /admin/employee/register
 * Registers a new employee
 */
export const registerEmployee = expressAsyncHandler(async (req, res, next) => {
    const newEmployee = await employeeService.registerEmployee({
        ...req.body,
        company: req.company._id // Add company ID from authenticated company
    });
    res.status(201).json(newEmployee);
});

/**
 * DELETE /admin/employee/:id
 * Deregister employee
 */
export const deregisterEmployee = expressAsyncHandler(async (req, res, next) => {
    const result = await employeeService.deregisterEmployee(req.params.id, req.company._id);
    res.status(200).json(result);
});
