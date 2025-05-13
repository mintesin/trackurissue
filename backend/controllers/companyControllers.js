/**
 * Company Controllers
 * Security improvements implemented:
 * 1. Proper error handling
 * 2. Secure authentication and registration
 * 3. Token-based authentication
 * 4. Input validation
 */

import expressAsyncHandler from 'express-async-handler';
import * as companyService from '../services/companyService.js';

/**
 * GET /admin/
 * Company dashboard
 */
export const companydashboard = expressAsyncHandler(async (req, res, next) => {
    const companyId = req.company._id;
    const dashboardData = await companyService.companyHome(companyId);
    res.status(200).json(dashboardData);
});

/**
 * GET /admin/register
 * Returns registration form template
 */
export const registerCompanyGet = expressAsyncHandler(async (req, res, next) => {
    const registrationFields = companyService.registerGet();
    res.status(200).json(registrationFields);
});

/**
 * POST /admin/register
 * Registers a new company
 */
export const registerCompanyPost = expressAsyncHandler(async (req, res, next) => {
    const newCompany = await companyService.registerPost(req.body);
    res.status(201).json(newCompany);
});

/**
 * GET /admin/login
 * Returns login form template
 */
export const loginCompanyGet = expressAsyncHandler(async (req, res, next) => {
    const loginFields = companyService.loginGet();
    res.status(200).json(loginFields);
});

/**
 * POST /admin/login
 * Authenticates company and returns JWT token
 */
export const loginCompanypost = expressAsyncHandler(async (req, res, next) => {
    const company = await companyService.loginPost(req.body);
    res.status(200).json(company);
});

/**
 * GET /admin/reset
 * Returns password reset form template
 */
export const resetAccountGet = expressAsyncHandler(async (req, res, next) => {
    const resetFields = companyService.resetAccountGet();
    res.status(200).json(resetFields);
});

/**
 * POST /admin/reset
 * Handles password reset
 */
export const resetAccountPost = expressAsyncHandler(async (req, res, next) => {
    const updatedCompany = await companyService.resetAccountPost(req.body);
    res.status(200).json(updatedCompany);
});

/**
 * GET /admin/profile
 * Get company profile
 */
export const getProfile = expressAsyncHandler(async (req, res, next) => {
    const company = await companyService.getProfile(req.company._id);
    res.status(200).json(company);
});

/**
 * PUT /admin/profile
 * Update company profile
 */
export const updateProfile = expressAsyncHandler(async (req, res, next) => {
    const updatedCompany = await companyService.updateCompany(req.company._id, req.body);
    res.status(200).json(updatedCompany);
});
