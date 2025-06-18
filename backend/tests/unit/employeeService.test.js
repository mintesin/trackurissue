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

describe('Employee Service Unit Tests', () => {
    let testCompany;

    beforeAll(async () => {
        await connectDB();
    });

    afterAll(async () => {
        await closeDatabase();
    });

    beforeEach(async () => {
        await clearDatabase();
        // Create a test company first
        const companyData = generateTestCompany();
        const result = await companyService.registerPost(companyData);
        testCompany = result.company;
    });

    describe('registerEmployee', () => {
        it('should create a new employee with hashed password', async () => {
            const testData = generateTestEmployee(testCompany._id);
            console.log('Test Data:', JSON.stringify(testData, null, 2));
            const result = await employeeService.registerEmployee(testData);

            expect(result).toHaveProperty('employee');
            expect(result).toHaveProperty('token');
            console.log('Test Data firstName:', testData.firstName);
            console.log('Result firstName:', result.employee.firstName);
            expect(result.employee.firstName).toBe(testData.firstName);
            expect(result.employee.company.toString()).toBe(testCompany._id.toString());

            // Verify password was hashed
            const savedEmployee = await employeeModel.findById(result.employee._id).select('+password');
            expect(savedEmployee.password).not.toBe(testData.password);
            const isMatch = await bcrypt.compare(testData.password, savedEmployee.password);
            expect(isMatch).toBe(true);
        });

        it('should validate required fields', async () => {
            const invalidData = {
                firstName: 'Test',
                // Missing required fields
            };

            await expect(employeeService.registerEmployee(invalidData))
                .rejects
                .toThrow();
        });

        it('should set correct authorization level', async () => {
            const testData = generateTestEmployee(testCompany._id, {}, {
                authorization: 'teamleader'
            });
            const result = await employeeService.registerEmployee(testData);
            expect(result.employee.authorization).toBe('teamleader');
        });
    });

    describe('loginEmployee', () => {
        let testEmployee;

        beforeEach(async () => {
            const employeeData = generateTestEmployee(testCompany._id);
            const result = await employeeService.registerEmployee(employeeData);
            testEmployee = result.employee;
        });

        it('should login with valid credentials', async () => {
            const loginData = {
                employeeEmail: testEmployee.employeeEmail,
                password: 'TestPassword123!'
            };

            const result = await employeeService.employeeLoginPost(loginData);
            expect(result).toHaveProperty('token');
            expect(result).toHaveProperty('employee');
            expect(result.employee._id.toString()).toBe(testEmployee._id.toString());
        });

        it('should not login with incorrect password', async () => {
            const loginData = {
                employeeEmail: testEmployee.employeeEmail,
                password: 'WrongPassword123!'
            };

            await expect(employeeService.employeeLoginPost(loginData))
                .rejects
                .toThrow();
        });
    });

    describe('employeeDashboard', () => {
        let testEmployee;

        beforeEach(async () => {
            const employeeData = generateTestEmployee(testCompany._id);
            const result = await employeeService.registerEmployee(employeeData);
            testEmployee = result.employee;
        });

        it('should get employee dashboard data', async () => {
            const result = await employeeService.employeeDashboard(testEmployee._id);
            
            expect(result).toHaveProperty('employee');
            expect(result.employee._id.toString()).toBe(testEmployee._id.toString());
            expect(result).toHaveProperty('team');
        });

        it('should handle non-existent employee', async () => {
            const nonExistentId = new mongoose.Types.ObjectId();
            await expect(employeeService.employeeDashboard(nonExistentId))
                .rejects
                .toThrow('Employee not found');
        });
    });

    describe('employeeResetAccountPost', () => {
        let testEmployee;

        beforeEach(async () => {
            const employeeData = generateTestEmployee(testCompany._id);
            const result = await employeeService.registerEmployee(employeeData);
            testEmployee = result.employee;
        });

        it('should reset password with correct security word', async () => {
            const resetData = {
                employeeEmail: testEmployee.employeeEmail,
                favoriteWord: 'test', // from generateTestEmployee
                password: 'NewTestPassword123!'
            };

            const result = await employeeService.employeeResetAccountPost(resetData);
            expect(result).toHaveProperty('message', 'Password reset successful');

            // Verify can login with new password
            const loginResult = await employeeService.employeeLoginPost({
                employeeEmail: testEmployee.employeeEmail,
                password: 'NewTestPassword123!'
            });
            expect(loginResult).toHaveProperty('token');
        });

        it('should not reset password with incorrect security word', async () => {
            const resetData = {
                employeeEmail: testEmployee.employeeEmail,
                favoriteWord: 'wrongword',
                password: 'NewTestPassword123!'
            };

            await expect(employeeService.employeeResetAccountPost(resetData))
                .rejects
                .toThrow();
        });
    });

    describe('getEmployeesByCompany', () => {
        beforeEach(async () => {
            // Create multiple test employees
            const employees = [
                generateTestEmployee(testCompany._id),
                generateTestEmployee(testCompany._id),
                generateTestEmployee(testCompany._id)
            ];

            for (const employee of employees) {
                await employeeService.registerEmployee(employee);
            }
        });

        it('should get all employees for a company', async () => {
            const employees = await employeeService.getEmployeesByCompany(testCompany._id);
            expect(Array.isArray(employees)).toBe(true);
            expect(employees.length).toBe(3);
            employees.forEach(employee => {
                expect(employee.company.toString()).toBe(testCompany._id.toString());
            });
        });

        it('should return empty array for non-existent company', async () => {
            const nonExistentId = new mongoose.Types.ObjectId();
            const employees = await employeeService.getEmployeesByCompany(nonExistentId);
            expect(Array.isArray(employees)).toBe(true);
            expect(employees.length).toBe(0);
        });
    });
});
