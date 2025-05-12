import request from 'supertest';
import app from '../../index.js';
import { 
    connectDB, 
    closeDatabase, 
    clearDatabase,
    generateTestCompany,
    generateTestEmployee,
    generateTestTeam,
    apiRequest
} from '../utils/testSetup.js';

describe('Team API Integration Tests', () => {
    let companyToken;
    let companyId;
    let teamLeaderToken;
    let teamLeaderId;

    beforeAll(async () => {
        await connectDB();
    });

    afterAll(async () => {
        await closeDatabase();
    });

    beforeEach(async () => {
        await clearDatabase();
        
        // Create test company
        const testCompany = generateTestCompany();
        const companyResponse = await apiRequest(request(app), '/api/companies/register', 'post', testCompany);
        companyToken = companyResponse.body.token;
        companyId = companyResponse.body.company._id;

        // Create team leader
        const teamLeader = generateTestEmployee(companyId, null, { authorization: 'teamleader' });
        const leaderResponse = await apiRequest(
            request(app),
            '/api/employees/register',
            'post',
            teamLeader,
            companyToken
        );
        teamLeaderToken = leaderResponse.body.token;
        teamLeaderId = leaderResponse.body.employee._id;
    });

    describe('POST /api/teams', () => {
        it('should create a new team successfully', async () => {
            const testTeam = generateTestTeam(companyId, teamLeaderId);
            const response = await apiRequest(
                request(app),
                '/api/teams',
                'post',
                testTeam,
                companyToken
            );

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('teamName', testTeam.teamName);
            expect(response.body.company.toString()).toBe(companyId);
            expect(response.body.teamLeader.toString()).toBe(teamLeaderId);
        });

        it('should not create team without company authorization', async () => {
            const testTeam = generateTestTeam(companyId, teamLeaderId);
            const response = await apiRequest(
                request(app),
                '/api/teams',
                'post',
                testTeam,
                teamLeaderToken // Using team leader token instead of company token
            );

            expect(response.status).toBe(403);
        });

        it('should validate required team fields', async () => {
            const invalidTeam = {
                // Missing required fields
                description: 'Test description'
            };

            const response = await apiRequest(
                request(app),
                '/api/teams',
                'post',
                invalidTeam,
                companyToken
            );

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });
    });

    describe('GET /api/teams/company/:companyId', () => {
        beforeEach(async () => {
            // Create multiple test teams
            const teams = [
                generateTestTeam(companyId, teamLeaderId),
                generateTestTeam(companyId, teamLeaderId),
                generateTestTeam(companyId, teamLeaderId)
            ];

            for (const team of teams) {
                await apiRequest(request(app), '/api/teams', 'post', team, companyToken);
            }
        });

        it('should get all teams for a company', async () => {
            const response = await apiRequest(
                request(app),
                `/api/teams/company/${companyId}`,
                'get',
                null,
                companyToken
            );

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(3);
            response.body.forEach(team => {
                expect(team.company.toString()).toBe(companyId);
            });
        });

        it('should not allow unauthorized access to company teams', async () => {
            const response = await request(app).get(`/api/teams/company/${companyId}`);
            expect(response.status).toBe(401);
        });
    });

    describe('PUT /api/teams/:teamId', () => {
        let teamId;

        beforeEach(async () => {
            const testTeam = generateTestTeam(companyId, teamLeaderId);
            const response = await apiRequest(
                request(app),
                '/api/teams',
                'post',
                testTeam,
                companyToken
            );
            teamId = response.body._id;
        });

        it('should update team details successfully', async () => {
            const updateData = {
                teamName: 'Updated Team Name',
                description: 'Updated description'
            };

            const response = await apiRequest(
                request(app),
                `/api/teams/${teamId}`,
                'put',
                updateData,
                companyToken
            );

            expect(response.status).toBe(200);
            expect(response.body.teamName).toBe(updateData.teamName);
            expect(response.body.description).toBe(updateData.description);
        });

        it('should not allow unauthorized team updates', async () => {
            const updateData = {
                teamName: 'Updated Team Name'
            };

            const response = await apiRequest(
                request(app),
                `/api/teams/${teamId}`,
                'put',
                updateData,
                teamLeaderToken // Using team leader token instead of company token
            );

            expect(response.status).toBe(403);
        });
    });

    describe('POST /api/teams/:teamId/members', () => {
        let teamId;
        let employeeId;

        beforeEach(async () => {
            // Create team
            const testTeam = generateTestTeam(companyId, teamLeaderId);
            const teamResponse = await apiRequest(
                request(app),
                '/api/teams',
                'post',
                testTeam,
                companyToken
            );
            teamId = teamResponse.body._id;

            // Create employee
            const employee = generateTestEmployee(companyId);
            const employeeResponse = await apiRequest(
                request(app),
                '/api/employees/register',
                'post',
                employee,
                companyToken
            );
            employeeId = employeeResponse.body.employee._id;
        });

        it('should add member to team successfully', async () => {
            const response = await apiRequest(
                request(app),
                `/api/teams/${teamId}/members`,
                'post',
                { employeeId },
                companyToken
            );

            expect(response.status).toBe(200);
            expect(response.body.members).toContain(employeeId);
        });

        it('should not add same member twice', async () => {
            // Add member first time
            await apiRequest(
                request(app),
                `/api/teams/${teamId}/members`,
                'post',
                { employeeId },
                companyToken
            );

            // Try to add same member again
            const response = await apiRequest(
                request(app),
                `/api/teams/${teamId}/members`,
                'post',
                { employeeId },
                companyToken
            );

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });
    });
});
