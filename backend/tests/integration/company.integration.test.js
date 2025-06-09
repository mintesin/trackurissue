/**
 * Integration Tests for Company API Endpoints
 * This test suite verifies the end-to-end functionality of company-related operations including:
 * - Company registration and authentication
 * - Profile management
 * - API security and validation
 * - Error handling and edge cases
 */

import request from 'supertest';
import app from '../../index.js';
import { 
    connectDB, 
    closeDatabase, 
    clearDatabase,
    generateTestCompany,
    generateTestToken,
    apiRequest
} from '../utils/testSetup.js';

/**
 * Main test suite for Company API Integration Tests
 * Tests end-to-end API functionality using supertest
 */
describe('Company API Integration Tests', () => {
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
     * Test suite for company registration endpoint
     * Verifies registration process and validation
     */
    describe('POST /admin/register', () => {
        /**
         * Tests successful company registration
         * Verifies response structure and data persistence
         */
        it('should register a new company successfully', async () => {
            const testCompany = generateTestCompany();
            const response = await apiRequest(request(app), '/api/admin/register', 'post', testCompany);

            // Verify response structure and content
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('company');
            expect(response.body).toHaveProperty('token');
            expect(response.body.company.companyName).toBe(testCompany.companyName);
        });

        /**
         * Tests validation of company registration data
         * Ensures API rejects invalid input formats
         */
        it('should not register a company with invalid data', async () => {
            const invalidCompany = generateTestCompany({ adminEmail: 'invalid-email' });
            const response = await apiRequest(request(app), '/api/admin/register', 'post', invalidCompany);

            // Verify error response
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });

        /**
         * Tests duplicate email validation
         * Ensures API prevents multiple registrations with same email
         */
        it('should not register a company with existing email', async () => {
            const testCompany = generateTestCompany();
            await apiRequest(request(app), '/api/admin/register', 'post', testCompany);
            
            // Attempt duplicate registration
            const response = await apiRequest(request(app), '/api/admin/register', 'post', testCompany);
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });
    });

    /**
     * Test suite for company login endpoint
     * Verifies authentication process and security
     */
    describe('POST /admin/login', () => {
        /**
         * Creates a test company before each login test
         */
        beforeEach(async () => {
            const testCompany = generateTestCompany();
            await apiRequest(request(app), '/api/admin/register', 'post', testCompany);
        });

        /**
         * Tests successful login with valid credentials
         * Verifies token generation and response
         */
        it('should login successfully with valid credentials', async () => {
            const loginData = {
                adminEmail: 'test@company.com',
                password: 'TestPassword123!'
            };

            const response = await apiRequest(request(app), '/api/admin/login', 'post', loginData);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('token');
        });

        /**
         * Tests login rejection with invalid password
         * Ensures proper error handling for authentication failures
         */
        it('should not login with invalid password', async () => {
            const loginData = {
                adminEmail: 'test@company.com',
                password: 'WrongPassword123!'
            };

            const response = await apiRequest(request(app), '/api/admin/login', 'post', loginData);
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error');
        });
    });

    /**
     * Test suite for company profile retrieval endpoint
     * Verifies profile access and authorization
     */
    describe('GET /admin/profile', () => {
        /** Authentication token for API requests */
        let token;
        /** ID of test company */
        let companyId;

        /**
         * Creates a test company and generates auth token before each test
         */
        beforeEach(async () => {
            const testCompany = generateTestCompany();
            const registerResponse = await apiRequest(request(app), '/api/admin/register', 'post', testCompany);
            token = registerResponse.body.token;
            companyId = registerResponse.body.company._id;
        });

        /**
         * Tests successful profile retrieval with valid token
         * Verifies response contains company data
         */
        it('should get company profile with valid token', async () => {
            const response = await apiRequest(
                request(app), 
                '/api/admin/profile', 
                'get', 
                null, 
                token
            );

            // Verify profile data is returned
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('companyName');
            expect(response.body).toHaveProperty('adminEmail');
        });

        /**
         * Tests profile access without authentication
         * Ensures unauthorized access is prevented
         */
        it('should not get profile without token', async () => {
            const response = await request(app).get('/api/admin/profile');
            expect(response.status).toBe(401);
        });
    });

    /**
     * Test suite for company profile update endpoint
     * Verifies profile modification and validation
     */
    describe('PUT /admin/profile', () => {
        /** Authentication token for API requests */
        let token;
        /** ID of test company */
        let companyId;

        /**
         * Creates a test company and generates auth token before each test
         */
        beforeEach(async () => {
            const testCompany = generateTestCompany();
            const registerResponse = await apiRequest(request(app), '/api/admin/register', 'post', testCompany);
            token = registerResponse.body.token;
            companyId = registerResponse.body.company._id;
        });

        /**
         * Tests successful profile update
         * Verifies changes are properly saved
         */
        it('should update company profile successfully', async () => {
            const updateData = {
                companyName: 'Updated Company Name',
                shortDescription: 'Updated description'
            };

            const response = await apiRequest(
                request(app),
                '/api/admin/profile',
                'put',
                updateData,
                token
            );

            // Verify profile was updated correctly
            expect(response.status).toBe(200);
            expect(response.body.companyName).toBe(updateData.companyName);
            expect(response.body.shortDescription).toBe(updateData.shortDescription);
        });

        /**
         * Tests validation during profile update
         * Ensures API rejects invalid update data
         */
        it('should not update with invalid data', async () => {
            const invalidData = {
                companyName: '', // empty name should be invalid
                shortDescription: 'Updated description'
            };

            const response = await apiRequest(
                request(app),
                '/api/admin/profile',
                'put',
                invalidData,
                token
            );

            // Verify update was rejected
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });
    });
});
