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
import * as chatRoomControllers from '../controllers/chatRoomController.js';
import * as employeeControllers from '../controllers/employeeController.js'; 
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

// Company Dashboard
router.get('/', companyControllers.companydashboard);

// Team Management Routes
router.route('/team')
    .get(teamControllers.teamcreationGet)
    .post(teamControllers.teamcreationPost);

router.route('/team/:teamId')
    .delete(teamControllers.teamdeletionGet);

router.route('/team/member')
    .post(teamControllers.addMemeberGet)
    .delete(teamControllers.removeMemeberGet);

// Issue Management Routes
router.route('/issues')
    .get(createdIssueControllers.issuelist)
    .post(createdIssueControllers.issueCreatePost);

router.route('/issues/:issueId')
    .get(createdIssueControllers.issueCreateGet)
    .put(createdIssueControllers.editIssuePost)
    .delete(createdIssueControllers.issueDeletePost);

router.route('/issues/assign/:issueId')
    .get(createdIssueControllers.assignIssueGet)
    .post(createdIssueControllers.assignIssuePost);

// Chat Room Management Routes
router.route('/room')
    .get(chatRoomControllers.createRoomGet)
    .post(chatRoomControllers.createRoomPost);

router.route('/room/:roomId')
    .delete(chatRoomControllers.deleteRoomGet)
    .post(chatRoomControllers.deleteRoomPost);

// Employee Management Routes
router.route('/employee')
    .get(employeeControllers.employeeregisterGet)
    .post(employeeControllers.employeeregisterPost);

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
