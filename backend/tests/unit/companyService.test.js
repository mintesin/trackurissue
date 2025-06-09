/**
 * Unit Tests for Company Service
 * This test suite verifies the functionality of company-related operations including:
 * - Company registration and authentication
 * - Password management and security
 * - Company profile updates
 * - Account recovery features
 */

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import * as companyService from '../../services/companyService.js';
import companyModel from '../../models/companyModel.js';
import { 
    connectDB, 
    closeDatabase, 
    clearDatabase,
    generateTestCompany 
} from '../utils/testSetup.js';

/**
 * Main test suite for Company Service operations
 * Tests company lifecycle management and authentication features
 */
describe('Company Service Unit Tests', () => {
    /**
     * Establishes database connection before running any tests
     */
    beforeAll(async () => {
        await connectDB();
    });

    /**
     * Closes database connection after all tests complete
     */
    afterAll(async () => {
        await closeDatabase();
    });

    /**
     * Clears the database before each test to ensure clean state
     */
    beforeEach(async () => {
        await clearDatabase();
    });

    /**
     * Test suite for company registration functionality
     * Verifies company creation, validation, and security features
     */
    describe('registerPost', () => {
        /**
         * Verifies successful company registration with proper password hashing
         * Tests that company data is correctly saved and password is securely hashed
         */
        it('should create a new company with hashed password', async () => {
            const testData = generateTestCompany();
            const result = await companyService.registerPost(testData);

            // Verify response structure and content
            expect(result).toHaveProperty('company');
            expect(result).toHaveProperty('token');
            expect(result.company.companyName).toBe(testData.companyName);
            expect(result.company.adminEmail).toBe(testData.adminEmail);

            // Verify password was properly hashed for security
            const savedCompany = await companyModel.findById(result.company._id).select('+password');
            expect(savedCompany.password).not.toBe(testData.password);
            const isMatch = await bcrypt.compare(testData.password, savedCompany.password);
            expect(isMatch).toBe(true);
        });

        /**
         * Tests validation of required fields during company registration
         * Ensures service rejects incomplete company data
         */
        it('should validate required fields', async () => {
            const invalidData = {
                companyName: 'Test Company',
                // Missing required fields: adminEmail, password, etc.
            };

            // Expect registration to fail with incomplete data
            await expect(companyService.registerPost(invalidData))
                .rejects
                .toThrow();
        });

        /**
         * Tests prevention of duplicate email registrations
         * Ensures companies cannot register with an email that's already in use
         */
        it('should not allow duplicate email registration', async () => {
            const testData = generateTestCompany();
            await companyService.registerPost(testData);

            // Attempt to register with same email should fail
            await expect(companyService.registerPost(testData))
                .rejects
                .toThrow();
        });
    });

    /**
     * Test suite for company login functionality
     * Verifies authentication process and credential validation
     */
    describe('loginPost', () => {
        /**
         * Creates a test company before each login test
         */
        beforeEach(async () => {
            const testData = generateTestCompany();
            await companyService.registerPost(testData);
        });

        /**
         * Verifies successful login with valid credentials
         * Tests that correct email/password combination returns token and company data
         */
        it('should login with valid credentials', async () => {
            const loginData = {
                adminEmail: 'test@company.com',
                password: 'TestPassword123!'
            };

            const result = await companyService.loginPost(loginData);
            
            // Verify login response contains required authentication data
            expect(result).toHaveProperty('token');
            expect(result).toHaveProperty('company');
        });

        /**
         * Tests login rejection with incorrect password
         * Ensures authentication fails with wrong credentials
         */
        it('should not login with incorrect password', async () => {
            const loginData = {
                adminEmail: 'test@company.com',
                password: 'WrongPassword123!'
            };

            // Expect login to fail with incorrect password
            await expect(companyService.loginPost(loginData))
                .rejects
                .toThrow();
        });

        /**
         * Tests login rejection for non-existent company
         * Ensures authentication fails for unregistered email addresses
         */
        it('should not login with non-existent email', async () => {
            const loginData = {
                adminEmail: 'nonexistent@company.com',
                password: 'TestPassword123!'
            };

            // Expect login to fail for non-existent company
            await expect(companyService.loginPost(loginData))
                .rejects
                .toThrow();
        });
    });

    /**
     * Test suite for company update functionality
     * Verifies company profile modifications and validation
     */
    describe('updateCompany', () => {
        /** Test company instance used for update tests */
        let testCompany;

        /**
         * Creates a test company before each update test
         */
        beforeEach(async () => {
            const testData = generateTestCompany();
            const result = await companyService.registerPost(testData);
            testCompany = result.company;
        });

        /**
         * Verifies successful update of company details
         * Tests that company profile data can be modified correctly
         */
        it('should update company details', async () => {
            const updateData = {
                companyName: 'Updated Company Name',
                shortDescription: 'Updated description'
            };

            const updatedCompany = await companyService.updateCompany(
                testCompany._id,
                updateData
            );

            // Verify updated fields match input data
            expect(updatedCompany.companyName).toBe(updateData.companyName);
            expect(updatedCompany.shortDescription).toBe(updateData.shortDescription);
        });

        /**
         * Tests validation during company update
         * Ensures service rejects invalid update data
         */
        it('should not update with invalid data', async () => {
            const invalidData = {
                companyName: '', // empty name should be invalid
            };

            // Expect update to fail with invalid data
            await expect(companyService.updateCompany(testCompany._id, invalidData))
                .rejects
                .toThrow();
        });

        /**
         * Tests update attempt on non-existent company
         * Ensures appropriate error when updating invalid company ID
         */
        it('should not update non-existent company', async () => {
            const nonExistentId = new mongoose.Types.ObjectId();
            const updateData = {
                companyName: 'Updated Company Name'
            };

            // Expect update to fail for non-existent company
            await expect(companyService.updateCompany(nonExistentId, updateData))
                .rejects
                .toThrow();
        });
    });

    /**
     * Test suite for company password reset functionality
     * Verifies account recovery process and security measures
     */
    describe('resetAccountPost', () => {
        /** Test company instance used for password reset tests */
        let testCompany;

        /**
         * Creates a test company before each password reset test
         */
        beforeEach(async () => {
            const testData = generateTestCompany();
            const result = await companyService.registerPost(testData);
            testCompany = result.company;
        });

        /**
         * Verifies successful password reset with correct security word
         * Tests complete password reset flow including validation of new password
         */
        it('should reset password with correct security word', async () => {
            const resetData = {
                adminEmail: testCompany.adminEmail,
                favoriteWord: 'test', // Security word from generateTestCompany
                newPassword: 'NewTestPassword123!'
            };

            const result = await companyService.resetAccountPost(resetData);
            
            // Verify password reset was successful
            expect(result).toHaveProperty('message', 'Password reset successful');

            // Verify can login with new password
            const loginResult = await companyService.loginPost({
                adminEmail: testCompany.adminEmail,
                password: 'NewTestPassword123!'
            });
            expect(loginResult).toHaveProperty('token');
        });

        /**
         * Tests password reset rejection with incorrect security word
         * Ensures security word validation prevents unauthorized password resets
         */
        it('should not reset password with incorrect security word', async () => {
            const resetData = {
                adminEmail: testCompany.adminEmail,
                favoriteWord: 'wrongword', // Incorrect security word
                newPassword: 'NewTestPassword123!'
            };

            // Expect password reset to fail with wrong security word
            await expect(companyService.resetAccountPost(resetData))
                .rejects
                .toThrow();
        });
    });
});
