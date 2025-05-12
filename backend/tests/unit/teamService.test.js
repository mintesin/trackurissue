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

describe('Team Service Unit Tests', () => {
    let testCompany;
    let testTeamLeader;

    beforeAll(async () => {
        await connectDB();
    });

    afterAll(async () => {
        await closeDatabase();
    });

    beforeEach(async () => {
        await clearDatabase();
        // Create test company
        const companyData = generateTestCompany();
        const companyResult = await companyService.registerPost(companyData);
        testCompany = companyResult.company;

        // Create team leader
        const leaderData = generateTestEmployee(testCompany._id, null, { authorization: 'teamleader' });
        const leaderResult = await employeeService.registerEmployee(leaderData);
        testTeamLeader = leaderResult.employee;
    });

    describe('createTeam', () => {
        it('should create a new team successfully', async () => {
            const testData = generateTestTeam(testCompany._id, testTeamLeader._id);
            const team = await teamService.createTeam(testData);

            expect(team).toHaveProperty('teamName', testData.teamName);
            expect(team.company.toString()).toBe(testCompany._id.toString());
            expect(team.teamLeader.toString()).toBe(testTeamLeader._id.toString());
        });

        it('should validate required fields', async () => {
            const invalidData = {
                description: 'Test description'
                // Missing required fields
            };

            await expect(teamService.createTeam(invalidData))
                .rejects
                .toThrow();
        });

        it('should validate team leader authorization', async () => {
            // Create regular employee
            const regularEmployee = await employeeService.registerEmployee(
                generateTestEmployee(testCompany._id)
            );

            const testData = generateTestTeam(testCompany._id, regularEmployee.employee._id);
            
            await expect(teamService.createTeam(testData))
                .rejects
                .toThrow();
        });
    });

    describe('getTeamsByCompany', () => {
        beforeEach(async () => {
            // Create multiple test teams
            const teams = [
                generateTestTeam(testCompany._id, testTeamLeader._id),
                generateTestTeam(testCompany._id, testTeamLeader._id),
                generateTestTeam(testCompany._id, testTeamLeader._id)
            ];

            for (const team of teams) {
                await teamService.createTeam(team);
            }
        });

        it('should get all teams for a company', async () => {
            const teams = await teamService.getTeamsByCompany(testCompany._id);
            
            expect(Array.isArray(teams)).toBe(true);
            expect(teams.length).toBe(3);
            teams.forEach(team => {
                expect(team.company.toString()).toBe(testCompany._id.toString());
            });
        });

        it('should return empty array for non-existent company', async () => {
            const nonExistentId = new mongoose.Types.ObjectId();
            const teams = await teamService.getTeamsByCompany(nonExistentId);
            
            expect(Array.isArray(teams)).toBe(true);
            expect(teams.length).toBe(0);
        });
    });

    describe('updateTeam', () => {
        let testTeam;

        beforeEach(async () => {
            const teamData = generateTestTeam(testCompany._id, testTeamLeader._id);
            testTeam = await teamService.createTeam(teamData);
        });

        it('should update team details successfully', async () => {
            const updateData = {
                teamName: 'Updated Team Name',
                description: 'Updated description'
            };

            const updatedTeam = await teamService.updateTeam(testTeam._id, updateData);
            
            expect(updatedTeam.teamName).toBe(updateData.teamName);
            expect(updatedTeam.description).toBe(updateData.description);
        });

        it('should not update with invalid data', async () => {
            const invalidData = {
                teamName: '', // empty name should be invalid
            };

            await expect(teamService.updateTeam(testTeam._id, invalidData))
                .rejects
                .toThrow();
        });

        it('should not update non-existent team', async () => {
            const nonExistentId = new mongoose.Types.ObjectId();
            const updateData = {
                teamName: 'Updated Team Name'
            };

            await expect(teamService.updateTeam(nonExistentId, updateData))
                .rejects
                .toThrow();
        });
    });

    describe('addTeamMember', () => {
        let testTeam;
        let testEmployee;

        beforeEach(async () => {
            // Create team
            const teamData = generateTestTeam(testCompany._id, testTeamLeader._id);
            testTeam = await teamService.createTeam(teamData);

            // Create employee
            const employeeData = generateTestEmployee(testCompany._id);
            const employeeResult = await employeeService.registerEmployee(employeeData);
            testEmployee = employeeResult.employee;
        });

        it('should add member to team successfully', async () => {
            const updatedTeam = await teamService.addTeamMember(testTeam._id, testEmployee._id);
            
            expect(updatedTeam.members).toContain(testEmployee._id);
            expect(updatedTeam.members.length).toBe(1);
        });

        it('should not add member from different company', async () => {
            // Create another company and employee
            const otherCompanyData = generateTestCompany();
            const otherCompany = (await companyService.registerPost(otherCompanyData)).company;
            const otherEmployeeData = generateTestEmployee(otherCompany._id);
            const otherEmployee = (await employeeService.registerEmployee(otherEmployeeData)).employee;

            await expect(teamService.addTeamMember(testTeam._id, otherEmployee._id))
                .rejects
                .toThrow();
        });

        it('should not add same member twice', async () => {
            // Add member first time
            await teamService.addTeamMember(testTeam._id, testEmployee._id);

            // Try to add same member again
            await expect(teamService.addTeamMember(testTeam._id, testEmployee._id))
                .rejects
                .toThrow();
        });
    });

    describe('removeTeamMember', () => {
        let testTeam;
        let testEmployee;

        beforeEach(async () => {
            // Create team
            const teamData = generateTestTeam(testCompany._id, testTeamLeader._id);
            testTeam = await teamService.createTeam(teamData);

            // Create and add employee
            const employeeData = generateTestEmployee(testCompany._id);
            const employeeResult = await employeeService.registerEmployee(employeeData);
            testEmployee = employeeResult.employee;
            
            await teamService.addTeamMember(testTeam._id, testEmployee._id);
        });

        it('should remove member from team successfully', async () => {
            const updatedTeam = await teamService.removeTeamMember(testTeam._id, testEmployee._id);
            
            expect(updatedTeam.members).not.toContain(testEmployee._id);
            expect(updatedTeam.members.length).toBe(0);
        });

        it('should not remove team leader', async () => {
            await expect(teamService.removeTeamMember(testTeam._id, testTeamLeader._id))
                .rejects
                .toThrow();
        });

        it('should handle removing non-existent member', async () => {
            const nonExistentId = new mongoose.Types.ObjectId();
            
            await expect(teamService.removeTeamMember(testTeam._id, nonExistentId))
                .rejects
                .toThrow();
        });
    });
});
