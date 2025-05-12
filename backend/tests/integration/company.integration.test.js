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

describe('Company API Integration Tests', () => {
    beforeAll(async () => {
        await connectDB();
    });

    afterAll(async () => {
        await closeDatabase();
    });

    beforeEach(async () => {
        await clearDatabase();
    });

    describe('POST /admin/register', () => {
        it('should register a new company successfully', async () => {
            const testCompany = generateTestCompany();
            const response = await apiRequest(request(app), '/admin/register', 'post', testCompany);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('company');
            expect(response.body).toHaveProperty('token');
            expect(response.body.company.companyName).toBe(testCompany.companyName);
        });

        it('should not register a company with invalid data', async () => {
            const invalidCompany = generateTestCompany({ adminEmail: 'invalid-email' });
            const response = await apiRequest(request(app), '/admin/register', 'post', invalidCompany);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });

        it('should not register a company with existing email', async () => {
            const testCompany = generateTestCompany();
            await apiRequest(request(app), '/admin/register', 'post', testCompany);
            
            const response = await apiRequest(request(app), '/admin/register', 'post', testCompany);
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });
    });

    describe('POST /admin/login', () => {
        beforeEach(async () => {
            const testCompany = generateTestCompany();
            await apiRequest(request(app), '/admin/register', 'post', testCompany);
        });

        it('should login successfully with valid credentials', async () => {
            const loginData = {
                adminEmail: 'test@company.com',
                password: 'TestPassword123!'
            };

            const response = await apiRequest(request(app), '/admin/login', 'post', loginData);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('token');
        });

        it('should not login with invalid password', async () => {
            const loginData = {
                adminEmail: 'test@company.com',
                password: 'WrongPassword123!'
            };

            const response = await apiRequest(request(app), '/admin/login', 'post', loginData);
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error');
        });
    });

    describe('GET /admin/profile', () => {
        let token;
        let companyId;

        beforeEach(async () => {
            const testCompany = generateTestCompany();
            const registerResponse = await apiRequest(request(app), '/admin/register', 'post', testCompany);
            token = registerResponse.body.token;
            companyId = registerResponse.body.company._id;
        });

        it('should get company profile with valid token', async () => {
            const response = await apiRequest(
                request(app), 
                '/admin/profile', 
                'get', 
                null, 
                token
            );

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('companyName');
            expect(response.body).toHaveProperty('adminEmail');
        });

        it('should not get profile without token', async () => {
            const response = await request(app).get('/admin/profile');
            expect(response.status).toBe(401);
        });
    });

    describe('PUT /admin/profile', () => {
        let token;
        let companyId;

        beforeEach(async () => {
            const testCompany = generateTestCompany();
            const registerResponse = await apiRequest(request(app), '/admin/register', 'post', testCompany);
            token = registerResponse.body.token;
            companyId = registerResponse.body.company._id;
        });

        it('should update company profile successfully', async () => {
            const updateData = {
                companyName: 'Updated Company Name',
                shortDescription: 'Updated description'
            };

            const response = await apiRequest(
                request(app),
                '/admin/profile',
                'put',
                updateData,
                token
            );

            expect(response.status).toBe(200);
            expect(response.body.companyName).toBe(updateData.companyName);
            expect(response.body.shortDescription).toBe(updateData.shortDescription);
        });

        it('should not update with invalid data', async () => {
            const invalidData = {
                companyName: '', // empty name should be invalid
                shortDescription: 'Updated description'
            };

            const response = await apiRequest(
                request(app),
                '/admin/profile',
                'put',
                invalidData,
                token
            );

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });
    });
});
