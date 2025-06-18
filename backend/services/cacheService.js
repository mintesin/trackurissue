import redisClient from '../config/redis.js';

class CacheService {
    constructor() {
        this.defaultTTL = 3600; // 1 hour
        this.shortTTL = 300;    // 5 minutes
        this.longTTL = 86400;   // 24 hours
    }

    // Generate cache keys
    generateKey(type, identifier, subKey = '') {
        const key = `trackurissue:${type}:${identifier}`;
        return subKey ? `${key}:${subKey}` : key;
    }

    // Company related caching
    async cacheCompanyData(companyId, data, ttl = this.defaultTTL) {
        const key = this.generateKey('company', companyId);
        return await redisClient.set(key, data, ttl);
    }

    async getCompanyData(companyId) {
        const key = this.generateKey('company', companyId);
        return await redisClient.get(key);
    }

    async invalidateCompanyData(companyId) {
        const pattern = this.generateKey('company', companyId) + '*';
        return await redisClient.flushPattern(pattern);
    }

    // Team related caching
    async cacheTeamData(teamId, data, ttl = this.defaultTTL) {
        const key = this.generateKey('team', teamId);
        return await redisClient.set(key, data, ttl);
    }

    async getTeamData(teamId) {
        const key = this.generateKey('team', teamId);
        return await redisClient.get(key);
    }

    async cacheTeamMembers(teamId, members, ttl = this.defaultTTL) {
        const key = this.generateKey('team', teamId, 'members');
        return await redisClient.set(key, members, ttl);
    }

    async getTeamMembers(teamId) {
        const key = this.generateKey('team', teamId, 'members');
        return await redisClient.get(key);
    }

    async invalidateTeamData(teamId) {
        const pattern = this.generateKey('team', teamId) + '*';
        return await redisClient.flushPattern(pattern);
    }

    // Employee related caching
    async cacheEmployeeData(employeeId, data, ttl = this.defaultTTL) {
        const key = this.generateKey('employee', employeeId);
        return await redisClient.set(key, data, ttl);
    }

    async getEmployeeData(employeeId) {
        const key = this.generateKey('employee', employeeId);
        return await redisClient.get(key);
    }

    async invalidateEmployeeData(employeeId) {
        const pattern = this.generateKey('employee', employeeId) + '*';
        return await redisClient.flushPattern(pattern);
    }

    // Issue related caching
    async cacheIssues(teamId, issues, ttl = this.shortTTL) {
        const key = this.generateKey('issues', teamId);
        return await redisClient.set(key, issues, ttl);
    }

    async getIssues(teamId) {
        const key = this.generateKey('issues', teamId);
        return await redisClient.get(key);
    }

    async invalidateIssues(teamId) {
        const pattern = this.generateKey('issues', teamId) + '*';
        return await redisClient.flushPattern(pattern);
    }

    // Sprint related caching
    async cacheSprintData(sprintId, data, ttl = this.defaultTTL) {
        const key = this.generateKey('sprint', sprintId);
        return await redisClient.set(key, data, ttl);
    }

    async getSprintData(sprintId) {
        const key = this.generateKey('sprint', sprintId);
        return await redisClient.get(key);
    }

    async cacheTeamSprints(teamId, sprints, ttl = this.defaultTTL) {
        const key = this.generateKey('sprints', teamId);
        return await redisClient.set(key, sprints, ttl);
    }

    async getTeamSprints(teamId) {
        const key = this.generateKey('sprints', teamId);
        return await redisClient.get(key);
    }

    async invalidateSprintData(sprintId, teamId = null) {
        const sprintPattern = this.generateKey('sprint', sprintId) + '*';
        await redisClient.flushPattern(sprintPattern);
        
        if (teamId) {
            const teamSprintsPattern = this.generateKey('sprints', teamId) + '*';
            await redisClient.flushPattern(teamSprintsPattern);
        }
    }

    // Milestone related caching
    async cacheMilestoneData(milestoneId, data, ttl = this.defaultTTL) {
        const key = this.generateKey('milestone', milestoneId);
        return await redisClient.set(key, data, ttl);
    }

    async getMilestoneData(milestoneId) {
        const key = this.generateKey('milestone', milestoneId);
        return await redisClient.get(key);
    }

    async cacheTeamMilestones(teamId, milestones, ttl = this.defaultTTL) {
        const key = this.generateKey('milestones', teamId);
        return await redisClient.set(key, milestones, ttl);
    }

    async getTeamMilestones(teamId) {
        const key = this.generateKey('milestones', teamId);
        return await redisClient.get(key);
    }

    async invalidateMilestoneData(milestoneId, teamId = null) {
        const milestonePattern = this.generateKey('milestone', milestoneId) + '*';
        await redisClient.flushPattern(milestonePattern);
        
        if (teamId) {
            const teamMilestonesPattern = this.generateKey('milestones', teamId) + '*';
            await redisClient.flushPattern(teamMilestonesPattern);
        }
    }

    // Dashboard statistics caching
    async cacheDashboardStats(companyId, stats, ttl = this.shortTTL) {
        const key = this.generateKey('dashboard', companyId, 'stats');
        return await redisClient.set(key, stats, ttl);
    }

    async getDashboardStats(companyId) {
        const key = this.generateKey('dashboard', companyId, 'stats');
        return await redisClient.get(key);
    }

    async invalidateDashboardStats(companyId) {
        const pattern = this.generateKey('dashboard', companyId) + '*';
        return await redisClient.flushPattern(pattern);
    }

    // Session management
    async cacheUserSession(userId, sessionData, ttl = this.longTTL) {
        const key = this.generateKey('session', userId);
        return await redisClient.set(key, sessionData, ttl);
    }

    async getUserSession(userId) {
        const key = this.generateKey('session', userId);
        return await redisClient.get(key);
    }

    async invalidateUserSession(userId) {
        const key = this.generateKey('session', userId);
        return await redisClient.del(key);
    }

    // Rate limiting
    async incrementRateLimit(identifier, window = 3600) {
        const key = this.generateKey('ratelimit', identifier);
        try {
            const current = await redisClient.get(key) || 0;
            const newCount = parseInt(current) + 1;
            await redisClient.set(key, newCount, window);
            return newCount;
        } catch (error) {
            console.error('Rate limit increment error:', error);
            return 1;
        }
    }

    async getRateLimit(identifier) {
        const key = this.generateKey('ratelimit', identifier);
        const count = await redisClient.get(key);
        return parseInt(count) || 0;
    }

    // Generic cache operations
    async cache(key, data, ttl = this.defaultTTL) {
        return await redisClient.set(key, data, ttl);
    }

    async retrieve(key) {
        return await redisClient.get(key);
    }

    async invalidate(key) {
        return await redisClient.del(key);
    }

    async exists(key) {
        return await redisClient.exists(key);
    }

    // Bulk operations
    async invalidateByPattern(pattern) {
        return await redisClient.flushPattern(pattern);
    }

    // Health check
    async healthCheck() {
        try {
            const testKey = 'health:check';
            const testValue = { timestamp: Date.now() };
            await redisClient.set(testKey, testValue, 60);
            const retrieved = await redisClient.get(testKey);
            await redisClient.del(testKey);
            return retrieved && retrieved.timestamp === testValue.timestamp;
        } catch (error) {
            console.error('Cache health check failed:', error);
            return false;
        }
    }
}

export default new CacheService();
