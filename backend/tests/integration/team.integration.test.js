/**
 * Integration Tests for Team API Endpoints
 * This test suite verifies the end-to-end functionality of team-related operations including:
 * - Team creation and management
 * - Team member operations
 * - Authorization and access control
 * - Company-team relationships
 */

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

/**
 * Main test suite for Team API Integration Tests
 * Tests end-to-end API functionality for team operations
 */
describe('Team API Integration Tests', () => {
    /** Authentication token for company admin operations */
    let companyToken;
    /** ID of the test company */
    let companyId;
    /** Authentication token for team leader operations */
    let teamLeaderToken;
    /** ID of the team leader */
    let teamLeaderId;

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
     * Clears database and sets up test environment before each test
     * Creates a test company and team leader for team operations
     */
    beforeEach(async () => {
        await clearDatabase();
        
        // Create test company for team context
        const testCompany = generateTestCompany();
        const companyResponse = await apiRequest(request(app), '/api/admin/register', 'post', testCompany);
        companyToken = companyResponse.body.token;
        companyId = companyResponse.body.company._id;

        // Create team leader with appropriate authorization
        const teamLeader = generateTestEmployee(companyId, null, { authorization: 'teamleader' });
        const leaderResponse = await apiRequest(
            request(app),
            '/api/employee/register',
            'post',
            teamLeader,
            companyToken
        );
        teamLeaderToken = leaderResponse.body.token;
        teamLeaderId = leaderResponse.body.employee._id;
    });

    /**
     * Test suite for team creation endpoint
     * Verifies team creation process and authorization
     */
    describe('POST /api/team', () => {
        /**
         * Tests successful team creation
         * Verifies response structure and team-company association
         */
        it('should create a new team successfully', async () => {
            const testTeam = generateTestTeam(companyId, teamLeaderId);
            const response = await apiRequest(
                request(app),
                '/api/team',
                'post',
                testTeam,
                companyToken
            );

            // Verify team creation response
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('teamName', testTeam.teamName);
            expect(response.body.company.toString()).toBe(companyId);
            expect(response.body.teamLeader.toString()).toBe(teamLeaderId);
        });

        /**
         * Tests authorization requirement for team creation
         * Ensures only company admins can create teams
         */
        it('should not create team without company authorization', async () => {
            const testTeam = generateTestTeam(companyId, teamLeaderId);
            const response = await apiRequest(
                request(app),
                '/api/team',
                'post',
                testTeam,
                teamLeaderToken // Using team leader token instead of company token
            );

            // Verify authorization failure
            expect(response.status).toBe(403);
        });

        /**
         * Tests validation of required team fields
         * Ensures API enforces data requirements
         */
        it('should validate required team fields', async () => {
            const invalidTeam = {
                // Missing required fields like teamName
                description: 'Test description'
            };

            const response = await apiRequest(
                request(app),
                '/api/team',
                'post',
                invalidTeam,
                companyToken
            );

            // Verify validation error response
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });
    });

    /**
     * Test suite for retrieving company teams endpoint
     * Verifies team listing functionality and access control
     */
    describe('GET /api/team/company/:companyId', () => {
        /**
         * Creates multiple test teams before each test
         * Sets up test data for team listing operations
         */
        beforeEach(async () => {
            // Create multiple test teams for listing tests
            const teams = [
                generateTestTeam(companyId, teamLeaderId),
                generateTestTeam(companyId, teamLeaderId),
                generateTestTeam(companyId, teamLeaderId)
            ];

            // Create each team in the database
            for (const team of teams) {
                await apiRequest(request(app), '/api/team', 'post', team, companyToken);
            }
        });

        /**
         * Tests successful retrieval of all company teams
         * Verifies response structure and team associations
         */
        it('should get all teams for a company', async () => {
            const response = await apiRequest(
                request(app),
                `/api/team/company/${companyId}`,
                'get',
                null,
                companyToken
            );

            // Verify teams listing response
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(3);
            response.body.forEach(team => {
                expect(team.company.toString()).toBe(companyId);
            });
        });

        /**
         * Tests unauthorized access prevention
         * Ensures teams can only be accessed with proper authentication
         */
        it('should not allow unauthorized access to company teams', async () => {
            const response = await request(app).get(`/api/team/company/${companyId}`);
            expect(response.status).toBe(401);
        });
    });

    /**
     * Test suite for team update endpoint
     * Verifies team modification and authorization
     */
    describe('PUT /api/team/:teamId', () => {
        /** ID of test team */
        let teamId;

        /**
         * Creates a test team before each update test
         */
        beforeEach(async () => {
            const testTeam = generateTestTeam(companyId, teamLeaderId);
            const response = await apiRequest(
                request(app),
                '/api/team',
                'post',
                testTeam,
                companyToken
            );
            teamId = response.body._id;
        });

        /**
         * Tests successful team details update
         * Verifies changes are properly saved
         */
        it('should update team details successfully', async () => {
            const updateData = {
                teamName: 'Updated Team Name',
                description: 'Updated description'
            };

            const response = await apiRequest(
                request(app),
                `/api/team/${teamId}`,
                'put',
                updateData,
                companyToken
            );

            // Verify team was updated correctly
            expect(response.status).toBe(200);
            expect(response.body.teamName).toBe(updateData.teamName);
            expect(response.body.description).toBe(updateData.description);
        });

        /**
         * Tests authorization requirement for team updates
         * Ensures only authorized users can modify teams
         */
        it('should not allow unauthorized team updates', async () => {
            const updateData = {
                teamName: 'Updated Team Name'
            };

            const response = await apiRequest(
                request(app),
                `/api/team/${teamId}`,
                'put',
                updateData,
                teamLeaderToken // Using team leader token instead of company token
            );

            // Verify authorization failure
            expect(response.status).toBe(403);
        });
    });

    /**
     * Test suite for team member management endpoint
     * Verifies team member addition and validation
     */
    describe('POST /api/team/:teamId/members', () => {
        /** ID of test team */
        let teamId;
        /** ID of test employee */
        let employeeId;

        /**
         * Creates test team and employee before each member operation test
         */
        beforeEach(async () => {
            // Create team for member operations
            const testTeam = generateTestTeam(companyId, teamLeaderId);
            const teamResponse = await apiRequest(
                request(app),
                '/api/team',
                'post',
                testTeam,
                companyToken
            );
            teamId = teamResponse.body._id;

            // Create employee to be added as team member
            const employee = generateTestEmployee(companyId);
            const employeeResponse = await apiRequest(
                request(app),
                '/api/employee/register',
                'post',
                employee,
                companyToken
            );
            employeeId = employeeResponse.body.employee._id;
        });

        /**
         * Tests successful addition of member to team
         * Verifies member is properly added to team
         */
        it('should add member to team successfully', async () => {
            const response = await apiRequest(
                request(app),
                `/api/team/${teamId}/members`,
                'post',
                { employeeId },
                companyToken
            );

            // Verify member was added successfully
            expect(response.status).toBe(200);
            expect(response.body.members).toContain(employeeId);
        });

        /**
         * Tests prevention of duplicate member addition
         * Ensures same employee cannot be added to team twice
         */
        it('should not add same member twice', async () => {
            // Add member first time
            await apiRequest(
                request(app),
                `/api/team/${teamId}/members`,
                'post',
                { employeeId },
                companyToken
            );

            // Try to add same member again
            const response = await apiRequest(
                request(app),
                `/api/team/${teamId}/members`,
                'post',
                { employeeId },
                companyToken
            );

            // Verify duplicate addition was prevented
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });
    });
});
