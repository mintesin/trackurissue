/**
 * Admin Routes Configuration
 * Security improvements implemented:
 * 1. Route-specific rate limiting
 * 2. Authentication middleware
 * 3. Protected routes
 * 4. Input validation
 * 5. Proper route organization
 */

import express from 'express';
import * as companyControllers from '../controllers/companyControllers.js';
import * as teamControllers from '../controllers/teamController.js';   
import * as createdIssueControllers from '../controllers/createdIssueContoller.js';
import * as employeeController from '../controllers/employeeController.js';
import { companyAuth, loginLimiter } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * Public Routes
 * These routes don't require authentication
 * Some have rate limiting for security
 */

// Company account management - public routes
router.get('/register', companyControllers.registerCompanyGet);
router.post('/register', loginLimiter, companyControllers.registerCompanyPost);
router.get('/login', companyControllers.loginCompanyGet);
router.post('/login', loginLimiter, companyControllers.loginCompanypost);
router.get('/reset', companyControllers.resetAccountGet);
router.post('/reset', loginLimiter, companyControllers.resetAccountPost);

/**
 * Protected Routes
 * All routes below this middleware require authentication
 * companyAuth middleware verifies JWT token and attaches company to req object
 */
router.use(companyAuth);

// Employee management routes
router.get('/employee/register', employeeController.getEmployeeRegistrationFields);
router.post('/employee/register', employeeController.registerEmployee);
router.delete('/employee/:id', employeeController.deregisterEmployee);

// Company Dashboard
router.get('/', companyControllers.companydashboard);

// Company Profile
router.route('/profile')
    .get(companyControllers.getProfile)
    .put(companyControllers.updateProfile);

// Team Management Routes
router.route('/team')
    .get(teamControllers.teamcreationGet)
    .post(teamControllers.teamcreationPost);

router.route('/team/:teamId')
    .get(teamControllers.teamdeletionGet)
    .delete(teamControllers.teamdeletionPost);

router.route('/team/:teamId/member')
    .get(teamControllers.getTeamMembers)
    .post(teamControllers.addTeamMember);

router.route('/team/:teamId/member/:employeeId')
    .delete(teamControllers.removeTeamMember);

// Issue Management Routes
router.route('/issues')
    .get(createdIssueControllers.issuelist)
    .post(createdIssueControllers.issueCreatePost);

// Static routes first
router.get('/issues/create', createdIssueControllers.issueCreateGet);

// Dynamic routes with IDs last
router.route('/issues/:issueId')
    .get(createdIssueControllers.getIssue)
    .put(createdIssueControllers.editIssuePost)
    .delete(createdIssueControllers.issueDeletePost);

// Assignment route after the main issue routes
router.route('/issues/:issueId/assign')
    .get(createdIssueControllers.assignIssueGet)
    .post(createdIssueControllers.assignIssuePost);

/**
 * Error Handler
 * Catch any errors in the routes and forward to error handler
 */
router.use((err, req, res, next) => {
    // Log error for debugging but don't expose details to client
    console.error('Admin Route Error:', err);
    next(err);
});

export default router;
