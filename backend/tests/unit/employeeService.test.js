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
            const result = await employeeService.registerEmployee(testData);

            expect(result).toHaveProperty('employee');
            expect(result).toHaveProperty('token');
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
            const testData = generateTestEmployee(testCompany._id, null, {
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
                email: testEmployee.email,
                password: 'TestPassword123!'
            };

            const result = await employeeService.loginEmployee(loginData);
            expect(result).toHaveProperty('token');
            expect(result).toHaveProperty('employee');
            expect(result.employee._id.toString()).toBe(testEmployee._id.toString());
        });

        it('should not login with incorrect password', async () => {
            const loginData = {
                email: testEmployee.email,
                password: 'WrongPassword123!'
            };

            await expect(employeeService.loginEmployee(loginData))
                .rejects
                .toThrow();
        });
    });

    describe('updateEmployee', () => {
        let testEmployee;

        beforeEach(async () => {
            const employeeData = generateTestEmployee(testCompany._id);
            const result = await employeeService.registerEmployee(employeeData);
            testEmployee = result.employee;
        });

        it('should update employee details', async () => {
            const updateData = {
                firstName: 'Updated',
                lastName: 'Name',
                city: 'New City'
            };

            const updatedEmployee = await employeeService.updateEmployee(
                testEmployee._id,
                updateData
            );

            expect(updatedEmployee.firstName).toBe(updateData.firstName);
            expect(updatedEmployee.lastName).toBe(updateData.lastName);
            expect(updatedEmployee.city).toBe(updateData.city);
        });

        it('should not update with invalid data', async () => {
            const invalidData = {
                firstName: '', // empty name should be invalid
            };

            await expect(employeeService.updateEmployee(testEmployee._id, invalidData))
                .rejects
                .toThrow();
        });

        it('should not update authorization level through normal update', async () => {
            const updateData = {
                authorization: 'admin' // should not be allowed to change
            };

            const updatedEmployee = await employeeService.updateEmployee(
                testEmployee._id,
                updateData
            );

            expect(updatedEmployee.authorization).toBe(testEmployee.authorization);
        });
    });

    describe('resetEmployeePassword', () => {
        let testEmployee;

        beforeEach(async () => {
            const employeeData = generateTestEmployee(testCompany._id);
            const result = await employeeService.registerEmployee(employeeData);
            testEmployee = result.employee;
        });

        it('should reset password with correct security word', async () => {
            const resetData = {
                email: testEmployee.email,
                favoriteWord: 'test', // from generateTestEmployee
                newPassword: 'NewTestPassword123!'
            };

            const result = await employeeService.resetPassword(resetData);
            expect(result).toHaveProperty('message', 'Password reset successful');

            // Verify can login with new password
            const loginResult = await employeeService.loginEmployee({
                email: testEmployee.email,
                password: 'NewTestPassword123!'
            });
            expect(loginResult).toHaveProperty('token');
        });

        it('should not reset password with incorrect security word', async () => {
            const resetData = {
                email: testEmployee.email,
                favoriteWord: 'wrongword',
                newPassword: 'NewTestPassword123!'
            };

            await expect(employeeService.resetPassword(resetData))
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
