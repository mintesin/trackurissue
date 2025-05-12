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

describe('Employee API Integration Tests', () => {
    let companyToken;
    let companyId;

    beforeAll(async () => {
        await connectDB();
    });

    afterAll(async () => {
        await closeDatabase();
    });

    beforeEach(async () => {
        await clearDatabase();
        // Create a test company first
        const testCompany = generateTestCompany();
        const companyResponse = await apiRequest(request(app), '/api/companies/register', 'post', testCompany);
        companyToken = companyResponse.body.token;
        companyId = companyResponse.body.company._id;
    });

    describe('POST /api/employees/register', () => {
        it('should register a new employee successfully', async () => {
            const testEmployee = generateTestEmployee(companyId);
            const response = await apiRequest(
                request(app),
                '/api/employees/register',
                'post',
                testEmployee,
                companyToken
            );

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('employee');
            expect(response.body).toHaveProperty('token');
            expect(response.body.employee.firstName).toBe(testEmployee.firstName);
            expect(response.body.employee.company.toString()).toBe(companyId);
        });

        it('should not register employee without company token', async () => {
            const testEmployee = generateTestEmployee(companyId);
            const response = await apiRequest(
                request(app),
                '/api/employees/register',
                'post',
                testEmployee
            );

            expect(response.status).toBe(401);
        });

        it('should validate required employee fields', async () => {
            const invalidEmployee = {
                firstName: 'Test',
                // Missing required fields
            };

            const response = await apiRequest(
                request(app),
                '/api/employees/register',
                'post',
                invalidEmployee,
                companyToken
            );

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });
    });

    describe('POST /api/employees/login', () => {
        let testEmployee;

        beforeEach(async () => {
            testEmployee = generateTestEmployee(companyId);
            await apiRequest(
                request(app),
                '/api/employees/register',
                'post',
                testEmployee,
                companyToken
            );
        });

        it('should login employee with valid credentials', async () => {
            const loginData = {
                email: testEmployee.email,
                password: testEmployee.password
            };

            const response = await apiRequest(
                request(app),
                '/api/employees/login',
                'post',
                loginData
            );

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('employee');
        });

        it('should not login with incorrect password', async () => {
            const loginData = {
                email: testEmployee.email,
                password: 'wrongpassword'
            };

            const response = await apiRequest(
                request(app),
                '/api/employees/login',
                'post',
                loginData
            );

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error');
        });
    });

    describe('GET /api/employees/profile', () => {
        let employeeToken;

        beforeEach(async () => {
            const testEmployee = generateTestEmployee(companyId);
            const registerResponse = await apiRequest(
                request(app),
                '/api/employees/register',
                'post',
                testEmployee,
                companyToken
            );
            employeeToken = registerResponse.body.token;
        });

        it('should get employee profile with valid token', async () => {
            const response = await apiRequest(
                request(app),
                '/api/employees/profile',
                'get',
                null,
                employeeToken
            );

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('firstName');
            expect(response.body).toHaveProperty('lastName');
            expect(response.body).toHaveProperty('authorization');
        });

        it('should not get profile without token', async () => {
            const response = await request(app).get('/api/employees/profile');
            expect(response.status).toBe(401);
        });
    });

    describe('PUT /api/employees/profile', () => {
        let employeeToken;
        let employeeId;

        beforeEach(async () => {
            const testEmployee = generateTestEmployee(companyId);
            const registerResponse = await apiRequest(
                request(app),
                '/api/employees/register',
                'post',
                testEmployee,
                companyToken
            );
            employeeToken = registerResponse.body.token;
            employeeId = registerResponse.body.employee._id;
        });

        it('should update employee profile successfully', async () => {
            const updateData = {
                firstName: 'Updated',
                lastName: 'Name'
            };

            const response = await apiRequest(
                request(app),
                '/api/employees/profile',
                'put',
                updateData,
                employeeToken
            );

            expect(response.status).toBe(200);
            expect(response.body.firstName).toBe(updateData.firstName);
            expect(response.body.lastName).toBe(updateData.lastName);
        });

        it('should not update with invalid data', async () => {
            const invalidData = {
                firstName: '', // empty name should be invalid
            };

            const response = await apiRequest(
                request(app),
                '/api/employees/profile',
                'put',
                invalidData,
                employeeToken
            );

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });
    });
});
