/**
 * Integration Tests for Employee API Endpoints
 * This test suite verifies the end-to-end functionality of employee-related operations including:
 * - Employee registration and authentication
 * - Profile management
 * - Company-employee relationships
 * - Authorization and security
 */

import request from 'supertest';
import app from '../../index.js';
import { 
    connectDB, 
    closeDatabase, 
    clearDatabase,
    generateTestCompany,
    generateTestEmployee,
    generateTestToken,
    apiRequest
} from '../utils/testSetup.js';

/**
 * Main test suite for Employee API Integration Tests
 * Tests end-to-end API functionality for employee operations
 */
describe('Employee API Integration Tests', () => {
    /** Authentication token for company admin operations */
    let companyToken;
    /** ID of the test company */
    let companyId;

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
     * Clears database and creates a test company before each test
     * Ensures clean state and proper company context for employee operations
     */
    beforeEach(async () => {
        await clearDatabase();
        // Create a test company first as employees belong to companies
        const testCompany = generateTestCompany();
        const companyResponse = await apiRequest(request(app), '/api/admin/register', 'post', testCompany);
        companyToken = companyResponse.body.token;
        companyId = companyResponse.body.company._id;
    });

    /**
     * Test suite for employee registration endpoint
     * Verifies employee creation and company association
     */
    describe('POST /api/employee/register', () => {
        /**
         * Tests successful employee registration
         * Verifies response structure and company association
         */
        it('should register a new employee successfully', async () => {
            const testEmployee = generateTestEmployee(companyId);
            const response = await apiRequest(
                request(app),
                '/api/employee/register',
                'post',
                testEmployee,
                companyToken
            );

            // Verify response structure and content
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('employee');
            expect(response.body).toHaveProperty('token');
            expect(response.body.employee.firstName).toBe(testEmployee.firstName);
            expect(response.body.employee.company.toString()).toBe(companyId);
        });

        /**
         * Tests authorization requirement for employee registration
         * Ensures only authenticated companies can register employees
         */
        it('should not register employee without company token', async () => {
            const testEmployee = generateTestEmployee(companyId);
            const response = await apiRequest(
                request(app),
                '/api/employee/register',
                'post',
                testEmployee
            );

            // Verify unauthorized access is prevented
            expect(response.status).toBe(401);
        });

        /**
         * Tests validation of required employee fields
         * Ensures API enforces data requirements
         */
        it('should validate required employee fields', async () => {
            const invalidEmployee = {
                firstName: 'Test',
                // Missing required fields: lastName, email, etc.
            };

            const response = await apiRequest(
                request(app),
                '/api/employee/register',
                'post',
                invalidEmployee,
                companyToken
            );

            // Verify validation error response
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });
    });

    /**
     * Test suite for employee login endpoint
     * Verifies authentication process and security
     */
    describe('POST /api/employee/login', () => {
        /** Test employee instance used across login tests */
        let testEmployee;

        /**
         * Creates a test employee before each login test
         */
        beforeEach(async () => {
            testEmployee = generateTestEmployee(companyId);
            await apiRequest(
                request(app),
                '/api/employee/register',
                'post',
                testEmployee,
                companyToken
            );
        });

        /**
         * Tests successful login with valid credentials
         * Verifies token generation and response structure
         */
        it('should login employee with valid credentials', async () => {
            const loginData = {
                email: testEmployee.email,
                password: testEmployee.password
            };

            const response = await apiRequest(
                request(app),
                '/api/employee/login',
                'post',
                loginData
            );

            // Verify successful authentication response
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('employee');
        });

        /**
         * Tests login rejection with incorrect password
         * Ensures proper security for invalid credentials
         */
        it('should not login with incorrect password', async () => {
            const loginData = {
                email: testEmployee.email,
                password: 'wrongpassword'
            };

            const response = await apiRequest(
                request(app),
                '/api/employee/login',
                'post',
                loginData
            );

            // Verify authentication failure response
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error');
        });
    });

    /**
     * Test suite for employee profile retrieval endpoint
     * Verifies profile access and authorization
     */
    describe('GET /api/employee/profile', () => {
        /** Authentication token for employee operations */
        let employeeToken;

        /**
         * Creates a test employee and generates auth token before each test
         */
        beforeEach(async () => {
            const testEmployee = generateTestEmployee(companyId);
            const registerResponse = await apiRequest(
                request(app),
                '/api/employee/register',
                'post',
                testEmployee,
                companyToken
            );
            employeeToken = registerResponse.body.token;
        });

        /**
         * Tests successful profile retrieval with valid token
         * Verifies response contains employee data
         */
        it('should get employee profile with valid token', async () => {
            const response = await apiRequest(
                request(app),
                '/api/employee/profile',
                'get',
                null,
                employeeToken
            );

            // Verify profile data is returned
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('firstName');
            expect(response.body).toHaveProperty('lastName');
            expect(response.body).toHaveProperty('authorization');
        });

        /**
         * Tests profile access without authentication
         * Ensures unauthorized access is prevented
         */
        it('should not get profile without token', async () => {
            const response = await request(app).get('/api/employee/profile');
            expect(response.status).toBe(401);
        });
    });

    /**
     * Test suite for employee profile update endpoint
     * Verifies profile modification and validation
     */
    describe('PUT /api/employee/profile', () => {
        /** Authentication token for employee operations */
        let employeeToken;
        /** ID of test employee */
        let employeeId;

        /**
         * Creates a test employee and generates auth token before each test
         */
        beforeEach(async () => {
            const testEmployee = generateTestEmployee(companyId);
            const registerResponse = await apiRequest(
                request(app),
                '/api/employee/register',
                'post',
                testEmployee,
                companyToken
            );
            employeeToken = registerResponse.body.token;
            employeeId = registerResponse.body.employee._id;
        });

        /**
         * Tests successful profile update
         * Verifies changes are properly saved
         */
        it('should update employee profile successfully', async () => {
            const updateData = {
                firstName: 'Updated',
                lastName: 'Name'
            };

            const response = await apiRequest(
                request(app),
                '/api/employee/profile',
                'put',
                updateData,
                employeeToken
            );

            // Verify profile was updated correctly
            expect(response.status).toBe(200);
            expect(response.body.firstName).toBe(updateData.firstName);
            expect(response.body.lastName).toBe(updateData.lastName);
        });

        /**
         * Tests validation during profile update
         * Ensures API rejects invalid update data
         */
        it('should not update with invalid data', async () => {
            const invalidData = {
                firstName: '', // empty name should be invalid
            };

            const response = await apiRequest(
                request(app),
                '/api/employee/profile',
                'put',
                invalidData,
                employeeToken
            );

            // Verify update was rejected
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });
    });
});
