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

describe('Company Service Unit Tests', () => {
    beforeAll(async () => {
        await connectDB();
    });

    afterAll(async () => {
        await closeDatabase();
    });

    beforeEach(async () => {
        await clearDatabase();
    });

    describe('registerPost', () => {
        it('should create a new company with hashed password', async () => {
            const testData = generateTestCompany();
            const result = await companyService.registerPost(testData);

            expect(result).toHaveProperty('company');
            expect(result).toHaveProperty('token');
            expect(result.company.companyName).toBe(testData.companyName);
            expect(result.company.adminEmail).toBe(testData.adminEmail);

            // Verify password was hashed
            const savedCompany = await companyModel.findById(result.company._id).select('+password');
            expect(savedCompany.password).not.toBe(testData.password);
            const isMatch = await bcrypt.compare(testData.password, savedCompany.password);
            expect(isMatch).toBe(true);
        });

        it('should validate required fields', async () => {
            const invalidData = {
                companyName: 'Test Company',
                // Missing required fields
            };

            await expect(companyService.registerPost(invalidData))
                .rejects
                .toThrow();
        });

        it('should not allow duplicate email registration', async () => {
            const testData = generateTestCompany();
            await companyService.registerPost(testData);

            await expect(companyService.registerPost(testData))
                .rejects
                .toThrow();
        });
    });

    describe('loginPost', () => {
        beforeEach(async () => {
            const testData = generateTestCompany();
            await companyService.registerPost(testData);
        });

        it('should login with valid credentials', async () => {
            const loginData = {
                adminEmail: 'test@company.com',
                password: 'TestPassword123!'
            };

            const result = await companyService.loginPost(loginData);
            expect(result).toHaveProperty('token');
            expect(result).toHaveProperty('company');
        });

        it('should not login with incorrect password', async () => {
            const loginData = {
                adminEmail: 'test@company.com',
                password: 'WrongPassword123!'
            };

            await expect(companyService.loginPost(loginData))
                .rejects
                .toThrow();
        });

        it('should not login with non-existent email', async () => {
            const loginData = {
                adminEmail: 'nonexistent@company.com',
                password: 'TestPassword123!'
            };

            await expect(companyService.loginPost(loginData))
                .rejects
                .toThrow();
        });
    });

    describe('updateCompany', () => {
        let testCompany;

        beforeEach(async () => {
            const testData = generateTestCompany();
            const result = await companyService.registerPost(testData);
            testCompany = result.company;
        });

        it('should update company details', async () => {
            const updateData = {
                companyName: 'Updated Company Name',
                shortDescription: 'Updated description'
            };

            const updatedCompany = await companyService.updateCompany(
                testCompany._id,
                updateData
            );

            expect(updatedCompany.companyName).toBe(updateData.companyName);
            expect(updatedCompany.shortDescription).toBe(updateData.shortDescription);
        });

        it('should not update with invalid data', async () => {
            const invalidData = {
                companyName: '', // empty name should be invalid
            };

            await expect(companyService.updateCompany(testCompany._id, invalidData))
                .rejects
                .toThrow();
        });

        it('should not update non-existent company', async () => {
            const nonExistentId = new mongoose.Types.ObjectId();
            const updateData = {
                companyName: 'Updated Company Name'
            };

            await expect(companyService.updateCompany(nonExistentId, updateData))
                .rejects
                .toThrow();
        });
    });

    describe('resetAccountPost', () => {
        let testCompany;

        beforeEach(async () => {
            const testData = generateTestCompany();
            const result = await companyService.registerPost(testData);
            testCompany = result.company;
        });

        it('should reset password with correct security word', async () => {
            const resetData = {
                adminEmail: testCompany.adminEmail,
                favoriteWord: 'test', // from generateTestCompany
                newPassword: 'NewTestPassword123!'
            };

            const result = await companyService.resetAccountPost(resetData);
            expect(result).toHaveProperty('message', 'Password reset successful');

            // Verify can login with new password
            const loginResult = await companyService.loginPost({
                adminEmail: testCompany.adminEmail,
                password: 'NewTestPassword123!'
            });
            expect(loginResult).toHaveProperty('token');
        });

        it('should not reset password with incorrect security word', async () => {
            const resetData = {
                adminEmail: testCompany.adminEmail,
                favoriteWord: 'wrongword',
                newPassword: 'NewTestPassword123!'
            };

            await expect(companyService.resetAccountPost(resetData))
                .rejects
                .toThrow();
        });
    });
});
