/**
 * Unit Tests for Employee Service
 * This test suite verifies the functionality of employee-related operations including:
 * - Employee registration and authentication
 * - Password management and security
 * - Employee dashboard and profile operations
 * - Company-employee relationships
 */

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import * as employeeService from '../../services/employeeService.js';
import employeeModel from '../../models/employeeModel.js';
import { 
    connectDB, 
    closeDatabase, 
    clearDatabase,
    generateTestCompany,
    generateTestEmployee 
} from '../utils/testSetup.js';
import * as companyService from '../../services/companyService.js';

/**
 * Main test suite for Employee Service operations
 * Tests employee lifecycle management and authentication features
 */
describe('Employee Service Unit Tests', () => {
    /** Test company instance used across all employee tests */
    let testCompany;

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
     * Before each test:
     * 1. Clears the database to ensure clean state
     * 2. Creates a test company for employee association
     */
    beforeEach(async () => {
        await clearDatabase();
        // Create a test company that employees will belong to
        const companyData = generateTestCompany();
        const result = await companyService.registerPost(companyData);
        testCompany = result.company;
    });

    /**
     * Test suite for employee registration functionality
     * Verifies employee creation, validation, and security features
     */
    describe('registerEmployee', () => {
        /**
         * Verifies successful employee registration with proper password hashing
         * Tests that employee data is correctly saved and password is securely hashed
         */
        it('should create a new employee with hashed password', async () => {
            const testData = generateTestEmployee(testCompany._id);
            console.log('Test Data:', JSON.stringify(testData, null, 2));
            const result = await employeeService.registerEmployee(testData);

            // Verify response structure contains employee and token
            expect(result).toHaveProperty('employee');
            expect(result).toHaveProperty('token');
            console.log('Test Data firstName:', testData.firstName);
            console.log('Result firstName:', result.employee.firstName);
            
            // Verify employee data matches input
            expect(result.employee.firstName).toBe(testData.firstName);
            expect(result.employee.company.toString()).toBe(testCompany._id.toString());

            // Verify password was properly hashed for security
            const savedEmployee = await employeeModel.findById(result.employee._id).select('+password');
            expect(savedEmployee.password).not.toBe(testData.password);
            const isMatch = await bcrypt.compare(testData.password, savedEmployee.password);
            expect(isMatch).toBe(true);
        });

        /**
         * Tests validation of required fields during employee registration
         * Ensures service rejects incomplete employee data
         */
        it('should validate required fields', async () => {
            const invalidData = {
                firstName: 'Test',
                // Missing required fields: lastName, email, password, etc.
            };

            // Expect registration to fail with incomplete data
            await expect(employeeService.registerEmployee(invalidData))
                .rejects
                .toThrow();
        });

        /**
         * Verifies correct assignment of authorization levels
         * Tests that employee roles are properly set during registration
         */
        it('should set correct authorization level', async () => {
            const testData = generateTestEmployee(testCompany._id, {}, {
                authorization: 'teamleader'
            });
            const result = await employeeService.registerEmployee(testData);
            
            // Verify authorization level was set correctly
            expect(result.employee.authorization).toBe('teamleader');
        });
    });

    /**
     * Test suite for employee login functionality
     * Verifies authentication process and credential validation
     */
    describe('loginEmployee', () => {
        /** Test employee instance used for login tests */
        let testEmployee;

        /**
         * Creates a test employee before each login test
         * Provides consistent employee credentials for authentication tests
         */
        beforeEach(async () => {
            const employeeData = generateTestEmployee(testCompany._id);
            const result = await employeeService.registerEmployee(employeeData);
            testEmployee = result.employee;
        });

        /**
         * Verifies successful login with valid credentials
         * Tests that correct email/password combination returns token and employee data
         */
        it('should login with valid credentials', async () => {
            const loginData = {
                employeeEmail: testEmployee.employeeEmail,
                password: 'TestPassword123!'
            };

            const result = await employeeService.employeeLoginPost(loginData);
            
            // Verify login response contains required authentication data
            expect(result).toHaveProperty('token');
            expect(result).toHaveProperty('employee');
            expect(result.employee._id.toString()).toBe(testEmployee._id.toString());
        });

        /**
         * Tests login rejection with incorrect password
         * Ensures authentication fails with wrong credentials
         */
        it('should not login with incorrect password', async () => {
            const loginData = {
                employeeEmail: testEmployee.employeeEmail,
                password: 'WrongPassword123!'
            };

            // Expect login to fail with incorrect password
            await expect(employeeService.employeeLoginPost(loginData))
                .rejects
                .toThrow();
        });
    });

    /**
     * Test suite for employee dashboard functionality
     * Verifies dashboard data retrieval and error handling
     */
    describe('employeeDashboard', () => {
        /** Test employee instance used for dashboard tests */
        let testEmployee;

        /**
         * Creates a test employee before each dashboard test
         * Provides employee context for dashboard data retrieval
         */
        beforeEach(async () => {
            const employeeData = generateTestEmployee(testCompany._id);
            const result = await employeeService.registerEmployee(employeeData);
            testEmployee = result.employee;
        });

        /**
         * Verifies successful retrieval of employee dashboard data
         * Tests that dashboard returns employee information and team associations
         */
        it('should get employee dashboard data', async () => {
            const result = await employeeService.employeeDashboard(testEmployee._id);
            
            // Verify dashboard response contains required data
            expect(result).toHaveProperty('employee');
            expect(result.employee._id.toString()).toBe(testEmployee._id.toString());
            expect(result).toHaveProperty('team');
        });

        /**
         * Tests error handling for non-existent employee dashboard request
         * Ensures appropriate error when requesting dashboard for invalid employee ID
         */
        it('should handle non-existent employee', async () => {
            const nonExistentId = new mongoose.Types.ObjectId();
            
            // Expect dashboard request to fail for non-existent employee
            await expect(employeeService.employeeDashboard(nonExistentId))
                .rejects
                .toThrow('Employee not found');
        });
    });

    /**
     * Test suite for employee password reset functionality
     * Verifies password reset process and security word validation
     */
    describe('employeeResetAccountPost', () => {
        /** Test employee instance used for password reset tests */
        let testEmployee;

        /**
         * Creates a test employee before each password reset test
         * Provides employee context for password reset operations
         */
        beforeEach(async () => {
            const employeeData = generateTestEmployee(testCompany._id);
            const result = await employeeService.registerEmployee(employeeData);
            testEmployee = result.employee;
        });

        /**
         * Verifies successful password reset with correct security word
         * Tests complete password reset flow including validation of new password
         */
        it('should reset password with correct security word', async () => {
            const resetData = {
                employeeEmail: testEmployee.employeeEmail,
                favoriteWord: 'test', // Security word from generateTestEmployee
                password: 'NewTestPassword123!'
            };

            const result = await employeeService.employeeResetAccountPost(resetData);
            
            // Verify password reset was successful
            expect(result).toHaveProperty('message', 'Password reset successful');

            // Verify employee can login with new password
            const loginResult = await employeeService.employeeLoginPost({
                employeeEmail: testEmployee.employeeEmail,
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
                employeeEmail: testEmployee.employeeEmail,
                favoriteWord: 'wrongword', // Incorrect security word
                password: 'NewTestPassword123!'
            };

            // Expect password reset to fail with wrong security word
            await expect(employeeService.employeeResetAccountPost(resetData))
                .rejects
                .toThrow();
        });
    });

    /**
     * Test suite for retrieving employees by company
     * Verifies company-employee relationship queries and edge cases
     */
    describe('getEmployeesByCompany', () => {
        /**
         * Creates multiple test employees before each test in this suite
         * Sets up 3 employees associated with the test company
         */
        beforeEach(async () => {
            // Create multiple test employees with different data
            const employees = [
                generateTestEmployee(testCompany._id),
                generateTestEmployee(testCompany._id),
                generateTestEmployee(testCompany._id)
            ];

            // Register all employees in the database
            for (const employee of employees) {
                await employeeService.registerEmployee(employee);
            }
        });

        /**
         * Verifies retrieval of all employees belonging to a specific company
         * Tests correct filtering and association of employees with their company
         */
        it('should get all employees for a company', async () => {
            const employees = await employeeService.getEmployeesByCompany(testCompany._id);
            
            // Verify response structure and content
            expect(Array.isArray(employees)).toBe(true);
            expect(employees.length).toBe(3);
            employees.forEach(employee => {
                expect(employee.company.toString()).toBe(testCompany._id.toString());
            });
        });

        /**
         * Tests behavior when querying employees for non-existent company
         * Should return empty array without throwing errors
         */
        it('should return empty array for non-existent company', async () => {
            const nonExistentId = new mongoose.Types.ObjectId();
            const employees = await employeeService.getEmployeesByCompany(nonExistentId);
            
            // Verify empty result for non-existent company
            expect(Array.isArray(employees)).toBe(true);
            expect(employees.length).toBe(0);
        });
    });
});
