/**
 * Unit Tests for Team Service
 * This test suite verifies the functionality of team-related operations including:
 * - Team creation and validation
 * - Team member management
 * - Team queries and updates
 */

import mongoose from 'mongoose';
import * as teamService from '../../services/teamService.js';
import * as companyService from '../../services/companyService.js';
import * as employeeService from '../../services/employeeService.js';
import { 
    connectDB, 
    closeDatabase, 
    clearDatabase,
    generateTestCompany,
    generateTestEmployee,
    generateTestTeam
} from '../utils/testSetup.js';

/**
 * Main test suite for Team Service operations
 * Sets up test environment before all tests and cleans up after completion
 */
describe('Team Service Unit Tests', () => {
    /** Test company instance used across all tests */
    let testCompany;
    /** Test team leader instance used across all tests */
    let testTeamLeader;

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
     * 2. Creates a test company
     * 3. Creates a team leader associated with the company
     */
    beforeEach(async () => {
        await clearDatabase();
        // Create test company with generated data
        const companyData = generateTestCompany();
        const companyResult = await companyService.registerPost(companyData);
        testCompany = companyResult.company;

        // Create team leader with appropriate authorization
        const leaderData = generateTestEmployee(testCompany._id, null, { authorization: 'teamleader' });
        const leaderResult = await employeeService.registerEmployee(leaderData);
        testTeamLeader = leaderResult.employee;
    });

    /**
     * Test suite for team creation functionality
     * Verifies team creation with valid and invalid data
     */
    describe('createTeam', () => {
        /**
         * Verifies successful team creation with valid data
         * Checks if team properties match input data
         */
        it('should create a new team successfully', async () => {
            const testData = generateTestTeam(testCompany._id, testTeamLeader._id);
            const team = await teamService.createTeam(testData);

            // Verify team properties match input data
            expect(team).toHaveProperty('teamName', testData.teamName);
            expect(team.company.toString()).toBe(testCompany._id.toString());
            expect(team.teamLeader.toString()).toBe(testTeamLeader._id.toString());
        });

        /**
         * Tests validation of required fields during team creation
         * Ensures service rejects incomplete team data
         */
        it('should validate required fields', async () => {
            const invalidData = {
                description: 'Test description'
                // Missing required fields: teamName, company
            };

            await expect(teamService.createTeam(invalidData))
                .rejects
                .toThrow();
        });

        /**
         * Verifies that only authorized users (team leaders) can create teams
         * Tests rejection when regular employee attempts team creation
         */
        it('should validate team leader authorization', async () => {
            // Create regular employee without team leader privileges
            const regularEmployee = await employeeService.registerEmployee(
                generateTestEmployee(testCompany._id)
            );

            const testData = generateTestTeam(testCompany._id, regularEmployee.employee._id);
            
            // Expect creation to fail due to insufficient authorization
            await expect(teamService.createTeam(testData))
                .rejects
                .toThrow();
        });
    });

    /**
     * Test suite for retrieving teams by company
     * Verifies team query functionality and edge cases
     */
    describe('getTeamsByCompany', () => {
        /**
         * Sets up multiple test teams for each test in this suite
         * Creates 3 teams associated with the test company
         */
        beforeEach(async () => {
            // Create multiple test teams with different names
            const teams = [
                generateTestTeam(testCompany._id, testTeamLeader._id),
                generateTestTeam(testCompany._id, testTeamLeader._id),
                generateTestTeam(testCompany._id, testTeamLeader._id)
            ];

            // Create all teams in the database
            for (const team of teams) {
                await teamService.createTeam(team);
            }
        });

        /**
         * Verifies retrieval of all teams belonging to a specific company
         * Ensures correct number of teams and proper company association
         */
        it('should get all teams for a company', async () => {
            const teams = await teamService.getTeamsByCompany(testCompany._id);
            
            // Verify response structure and content
            expect(Array.isArray(teams)).toBe(true);
            expect(teams.length).toBe(3);
            teams.forEach(team => {
                expect(team.company.toString()).toBe(testCompany._id.toString());
            });
        });

        /**
         * Tests behavior when querying teams for non-existent company
         * Should return empty array without throwing errors
         */
        it('should return empty array for non-existent company', async () => {
            const nonExistentId = new mongoose.Types.ObjectId();
            const teams = await teamService.getTeamsByCompany(nonExistentId);
            
            // Verify empty result for non-existent company
            expect(Array.isArray(teams)).toBe(true);
            expect(teams.length).toBe(0);
        });
    });

    /**
     * Test suite for team update functionality
     * Verifies team modification operations and validation
     */
    describe('updateTeam', () => {
        /** Test team instance created for each test */
        let testTeam;

        /**
         * Creates a test team before each update test
         * Provides a consistent team to modify in tests
         */
        beforeEach(async () => {
            const teamData = generateTestTeam(testCompany._id, testTeamLeader._id);
            testTeam = await teamService.createTeam(teamData);
        });

        /**
         * Verifies successful team update with valid data
         * Checks if updated properties are correctly saved
         */
        it('should update team details successfully', async () => {
            const updateData = {
                teamName: 'Updated Team Name',
                description: 'Updated description'
            };

            const updatedTeam = await teamService.updateTeam(testTeam._id, updateData);
            
            // Verify updated properties match input data
            expect(updatedTeam.teamName).toBe(updateData.teamName);
            expect(updatedTeam.description).toBe(updateData.description);
        });

        /**
         * Tests validation during team update with invalid data
         * Ensures service rejects updates with invalid values
         */
        it('should not update with invalid data', async () => {
            const invalidData = {
                teamName: '', // empty name should be invalid
            };

            // Expect update to fail with invalid data
            await expect(teamService.updateTeam(testTeam._id, invalidData))
                .rejects
                .toThrow();
        });

        /**
         * Tests update attempt on non-existent team
         * Should throw appropriate error for missing team
         */
        it('should not update non-existent team', async () => {
            const nonExistentId = new mongoose.Types.ObjectId();
            const updateData = {
                teamName: 'Updated Team Name'
            };

            // Expect update to fail for non-existent team
            await expect(teamService.updateTeam(nonExistentId, updateData))
                .rejects
                .toThrow();
        });
    });

    /**
     * Test suite for team member addition functionality
     * Verifies member addition operations and validation rules
     */
    describe('addTeamMember', () => {
        /** Test team instance used across member addition tests */
        let testTeam;
        /** Test employee instance to be added as team member */
        let testEmployee;

        /**
         * Before each test:
         * 1. Creates a test team
         * 2. Creates a test employee that can be added to the team
         */
        beforeEach(async () => {
            // Create team with test data
            const teamData = generateTestTeam(testCompany._id, testTeamLeader._id);
            testTeam = await teamService.createTeam(teamData);

            // Create employee to be added to team
            const employeeData = generateTestEmployee(testCompany._id);
            const employeeResult = await employeeService.registerEmployee(employeeData);
            testEmployee = employeeResult.employee;
        });

        /**
         * Verifies successful addition of a new team member
         * Checks if member is properly added to team's member list
         */
        it('should add member to team successfully', async () => {
            const updatedTeam = await teamService.addTeamMember(testTeam._id, testEmployee._id);
            
            // Verify member was added correctly
            expect(updatedTeam.members).toContain(testEmployee._id);
            expect(updatedTeam.members.length).toBe(1);
        });

        /**
         * Tests validation preventing cross-company member addition
         * Ensures employees can only be added to teams in their own company
         */
        it('should not add member from different company', async () => {
            // Create another company and its employee
            const otherCompanyData = generateTestCompany();
            const otherCompany = (await companyService.registerPost(otherCompanyData)).company;
            const otherEmployeeData = generateTestEmployee(otherCompany._id);
            const otherEmployee = (await employeeService.registerEmployee(otherEmployeeData)).employee;

            // Attempt to add employee from different company should fail
            await expect(teamService.addTeamMember(testTeam._id, otherEmployee._id))
                .rejects
                .toThrow();
        });

        /**
         * Tests duplicate member validation
         * Ensures same employee cannot be added to team multiple times
         */
        it('should not add same member twice', async () => {
            // First addition should succeed
            await teamService.addTeamMember(testTeam._id, testEmployee._id);

            // Second addition should fail
            await expect(teamService.addTeamMember(testTeam._id, testEmployee._id))
                .rejects
                .toThrow();
        });
    });

    /**
     * Test suite for team member removal functionality
     * Verifies member removal operations and associated validations
     */
    describe('removeTeamMember', () => {
        /** Test team instance used across member removal tests */
        let testTeam;
        /** Test employee instance to be removed from team */
        let testEmployee;

        /**
         * Before each test:
         * 1. Creates a test team
         * 2. Creates and adds a test employee to the team
         */
        beforeEach(async () => {
            // Create team with test data
            const teamData = generateTestTeam(testCompany._id, testTeamLeader._id);
            testTeam = await teamService.createTeam(teamData);

            // Create employee and add them to the team
            const employeeData = generateTestEmployee(testCompany._id);
            const employeeResult = await employeeService.registerEmployee(employeeData);
            testEmployee = employeeResult.employee;
            
            await teamService.addTeamMember(testTeam._id, testEmployee._id);
        });

        /**
         * Verifies successful removal of a team member
         * Checks if member is properly removed from team's member list
         */
        it('should remove member from team successfully', async () => {
            const updatedTeam = await teamService.removeTeamMember(testTeam._id, testEmployee._id);
            
            // Verify member was removed correctly
            expect(updatedTeam.members).not.toContain(testEmployee._id);
            expect(updatedTeam.members.length).toBe(0);
        });

        /**
         * Tests protection of team leader role
         * Ensures team leader cannot be removed from their own team
         */
        it('should not remove team leader', async () => {
            // Attempt to remove team leader should fail
            await expect(teamService.removeTeamMember(testTeam._id, testTeamLeader._id))
                .rejects
                .toThrow();
        });

        /**
         * Tests handling of non-existent member removal
         * Ensures appropriate error when attempting to remove non-member
         */
        it('should handle removing non-existent member', async () => {
            const nonExistentId = new mongoose.Types.ObjectId();
            
            // Attempt to remove non-existent member should fail
            await expect(teamService.removeTeamMember(testTeam._id, nonExistentId))
                .rejects
                .toThrow();
        });
    });
});
