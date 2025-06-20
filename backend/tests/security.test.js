/**
 * Security Test Suite
 * Tests for:
 * 1. Password hashing
 * 2. JWT authentication
 * 3. Rate limiting
 * 4. Input validation
 * 5. Error handling
 */

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import companyModel from '../models/companyModel.js';
import * as companyService from '../services/companyService.js';
import { connectDB, closeDatabase, clearDatabase } from './utils/testSetup.js';

dotenv.config();

const testCompany = {
    companyName: 'Test Security Company',
    adminName: 'Test Admin',
    shortDescription: 'Test Description',
    adminEmail: 'test@security.com',
    streetNumber: '123',
    city: 'Test City',
    state: 'Test State',
    zipcode: '12345',
    country: 'Test Country',
    favoriteWord: 'security',
    password: 'TestPassword123!'
};

describe('Security Tests', () => {
    beforeAll(async () => {
        await connectDB();
    }, 30000);

    afterAll(async () => {
        await closeDatabase();
    }, 30000);

    beforeEach(async () => {
        await clearDatabase();
    }, 10000);

    describe('Password Security', () => {
        test('Password should be hashed before saving', async () => {
            const company = await companyService.registerPost(testCompany);
            const savedCompany = await companyModel.findById(company.company._id).select('+password');
            
            // Password should be hashed
            expect(savedCompany.password).not.toBe(testCompany.password);
            // Should be able to verify password
            const isMatch = await bcrypt.compare(testCompany.password, savedCompany.password);
            expect(isMatch).toBe(true);
        });

        test('Should not store plain text passwords', async () => {
            const company = await companyService.registerPost(testCompany);
            const savedCompany = await companyModel.findById(company.company._id);
            
            // Password should not be included in regular queries
            expect(savedCompany.password).toBeUndefined();
        });
    });

    describe('Authentication', () => {
        test('Should generate valid JWT token on login', async () => {
            // Register company
            await companyService.registerPost(testCompany);
            
            // Login
            const loginResult = await companyService.loginPost({
                adminEmail: testCompany.adminEmail,
                password: testCompany.password
            });

            // Verify token
            expect(loginResult.token).toBeDefined();
            const decoded = jwt.verify(loginResult.token, process.env.JWT_SECRET);
            expect(decoded.id).toBeDefined();
        });

        test('Should reject invalid credentials', async () => {
            // Register company
            await companyService.registerPost(testCompany);
            
            // Attempt login with wrong password
            await expect(companyService.loginPost({
                adminEmail: testCompany.adminEmail,
                password: 'wrongpassword'
            })).rejects.toThrow();
        });
    });

    describe('Input Validation', () => {
        test('Should reject invalid email format', async () => {
            const invalidCompany = { ...testCompany, adminEmail: 'invalid-email' };
            await expect(companyService.registerPost(invalidCompany)).rejects.toThrow();
        });

        test('Should reject weak passwords', async () => {
            const weakPasswordCompany = { ...testCompany, password: '123' };
            await expect(companyService.registerPost(weakPasswordCompany)).rejects.toThrow();
        });
    });

    describe('Data Sanitization', () => {
        test('Should trim whitespace from inputs', async () => {
            const companyWithWhitespace = {
                ...testCompany,
                companyName: '  Test Company  ',
                adminEmail: '  test@security.com  '
            };

            const result = await companyService.registerPost(companyWithWhitespace);
            expect(result.company.companyName).toBe('Test Company');
            expect(result.company.adminEmail).toBe('test@security.com');
        });
    });

    describe('Rate Limiting', () => {
        test('Rate limiters should be properly configured middleware', async () => {
            const authMiddleware = await import('../middleware/authMiddleware.js');
            
            // Test that rate limiters exist and are functions
            expect(authMiddleware.loginLimiter).toBeDefined();
            expect(typeof authMiddleware.loginLimiter).toBe('function');
            expect(authMiddleware.apiLimiter).toBeDefined();
            expect(typeof authMiddleware.apiLimiter).toBe('function');
        });

        test('Rate limiters should be callable middleware functions', async () => {
            const authMiddleware = await import('../middleware/authMiddleware.js');
            
            // Create mock request and response objects
            const mockReq = {};
            const mockRes = {};
            const next = () => {};

            // Test that the middleware functions can be called without throwing
            expect(() => {
                authMiddleware.loginLimiter(mockReq, mockRes, next);
                authMiddleware.apiLimiter(mockReq, mockRes, next);
            }).not.toThrow();
        });
    });

    describe('Password Reset', () => {
        test('Should allow password reset with correct security word', async () => {
            // Register company
            await companyService.registerPost(testCompany);

            // Reset password
            const resetResult = await companyService.resetAccountPost({
                adminEmail: testCompany.adminEmail,
                favoriteWord: testCompany.favoriteWord,
                newPassword: 'NewSecurePassword123!'
            });

            expect(resetResult.message).toBe('Password reset successful');

            // Should be able to login with new password
            const loginResult = await companyService.loginPost({
                adminEmail: testCompany.adminEmail,
                password: 'NewSecurePassword123!'
            });

            expect(loginResult.token).toBeDefined();
        });

        test('Should reject password reset with wrong security word', async () => {
            // Register company
            await companyService.registerPost(testCompany);

            // Attempt reset with wrong security word
            await expect(companyService.resetAccountPost({
                adminEmail: testCompany.adminEmail,
                favoriteWord: 'wrongword',
                newPassword: 'NewSecurePassword123!'
            })).rejects.toThrow();
        });
    });
});
