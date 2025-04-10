
// the one chaining is this one

import expressAsyncHandler from 'express-async-handler';
import * as companyService from '../services/companyService.js'

// this controllers handles the request and response part of the routes 
// all the interaction with the database should be done by functions from company services 
//
const asynchandler =expressAsyncHandler

/**
 * GET /company/dashboard
 * Fetches and displays the company dashboard with:
 * - Company basic info
 * - List of employees (first name, last name, team)
 * - Team information
 * - Created issues
 */
export const companydashboard = expressAsyncHandler(async (req, res, next) => {
    try {
        const companyId = req.company._id; // Assuming company is set in auth middleware
        const dashboardData = await companyService.companyHome(companyId);
        res.status(200).json(dashboardData);
    } catch (err) {
        next(err);
    }
});

/**
 * GET /company/register
 * Returns the registration form fields required to create a new company
 * Includes all fields from company model as empty template
 */
export const registerCompanyGet = asynchandler(async(req, res, next) => {
    try {
        const registrationFields = companyService.registerGet();
        res.status(200).json(registrationFields);
    } catch (err) {
        next(err);
    }
});

/**
 * POST /company/register
 * Creates a new company record in database
 * Validates and processes registration form data
 * Returns the newly created company object
 */
export const registerCompanyPost = asynchandler(async(req, res, next) => { 
    try {
        const newCompany = await companyService.registerPost(req.body);
        res.status(201).json(newCompany);
    } catch (err) {
        next(err);
    }
});

/**
 * GET /company/login
 * Returns the login form fields (email and password)
 * Used to initialize the login form on client side
 */
export const loginCompanyGet = asynchandler(async(req, res, next) => {
    try {
        const loginFields = companyService.loginGet();
        res.status(200).json(loginFields);
    } catch (err) {
        next(err);
    }
});

/**
 * POST /company/login
 * Authenticates company credentials
 * Validates email and password against database
 * Returns company object if authentication succeeds
 */
export const loginCompanypost = asynchandler(async(req, res, next) => {
    try {
        const company = await companyService.loginPost(req.body);
        res.status(200).json(company);
    } catch (err) {
        next(err);
    }
});

/**
 * GET /company/reset
 * Returns password reset form fields:
 * - Email
 * - Favorite word (security question)
 * - New password field
 */
export const resetAccountGet = asynchandler(async (req, res, next) => {
    try {
        const resetFields = companyService.resetAccountGet();
        res.status(200).json(resetFields);
    } catch (err) {
        next(err);
    }
});

/**
 * POST /company/reset
 * Handles password reset request
 * Verifies email and favorite word match
 * Updates password if verification succeeds
 * Returns updated company object
 */
export const resetAccountPost = asynchandler(async (req, res, next) => {
    try {
        const updatedCompany = await companyService.resetAccountPost(req.body);
        res.status(200).json(updatedCompany);
    } catch (err) {
        next(err);
    }
});





