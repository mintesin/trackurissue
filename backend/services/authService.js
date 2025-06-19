import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import cacheService from './cacheService.js';
import loggingService from './loggingService.js';

class AuthService {
    constructor() {
        this.accessTokenSecret = process.env.JWT_SECRET || 'your-secret-key';
        this.refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || 'refresh-secret-key';
        this.accessTokenExpiry = '1h';  // 1 hour
        this.refreshTokenExpiry = '7d'; // 7 days

        // Define role hierarchy and permissions
        this.roleHierarchy = {
            admin: ['admin', 'teamleader', 'employee'],
            teamleader: ['teamleader', 'employee'],
            employee: ['employee']
        };

        this.permissions = {
            admin: [
                'manage:company',
                'manage:teams',
                'manage:employees',
                'manage:issues',
                'manage:sprints',
                'manage:milestones',
                'view:all'
            ],
            teamleader: [
                'manage:team',
                'manage:team_issues',
                'manage:team_sprints',
                'manage:team_milestones',
                'view:team'
            ],
            employee: [
                'view:assigned_issues',
                'update:assigned_issues',
                'view:team_issues',
                'view:team_sprints',
                'view:team_milestones'
            ]
        };
    }

    // Generate access token
    generateAccessToken(user) {
        return jwt.sign(
            {
                id: user._id,
                email: user.email || user.employeeEmail,
                role: user.authorization || 'admin',
                company: user.company,
                team: user.team
            },
            this.accessTokenSecret,
            { expiresIn: this.accessTokenExpiry }
        );
    }

    // Generate refresh token
    generateRefreshToken(user) {
        const refreshToken = jwt.sign(
            { id: user._id },
            this.refreshTokenSecret,
            { expiresIn: this.refreshTokenExpiry }
        );

        // Store refresh token in cache
        cacheService.cache(`refresh_token:${user._id}`, refreshToken, 7 * 24 * 60 * 60); // 7 days

        return refreshToken;
    }

    // Verify access token
    verifyAccessToken(token) {
        try {
            return jwt.verify(token, this.accessTokenSecret);
        } catch (error) {
            loggingService.logSecurityEvent('Invalid access token', { error: error.message });
            return null;
        }
    }

    // Verify refresh token
    async verifyRefreshToken(token) {
        try {
            const decoded = jwt.verify(token, this.refreshTokenSecret);
            const cachedToken = await cacheService.retrieve(`refresh_token:${decoded.id}`);

            if (token !== cachedToken) {
                loggingService.logSecurityEvent('Invalid refresh token', { userId: decoded.id });
                return null;
            }

            return decoded;
        } catch (error) {
            loggingService.logSecurityEvent('Refresh token verification failed', { error: error.message });
            return null;
        }
    }

    // Refresh access token
    async refreshAccessToken(refreshToken) {
        const decoded = await this.verifyRefreshToken(refreshToken);
        if (!decoded) {
            throw new Error('Invalid refresh token');
        }

        // Get user from cache or database
        const user = await cacheService.retrieve(`user:${decoded.id}`);
        if (!user) {
            throw new Error('User not found');
        }

        return this.generateAccessToken(user);
    }

    // Invalidate refresh token
    async invalidateRefreshToken(userId) {
        await cacheService.invalidate(`refresh_token:${userId}`);
        loggingService.logSecurityEvent('Refresh token invalidated', { userId });
    }

    // Check if user has permission
    hasPermission(userRole, requiredPermission) {
        const allowedRoles = Object.keys(this.roleHierarchy).filter(role => 
            this.roleHierarchy[role].includes(userRole)
        );

        return allowedRoles.some(role => 
            this.permissions[role].includes(requiredPermission)
        );
    }

    // Get all permissions for a role
    getRolePermissions(role) {
        const allowedRoles = this.roleHierarchy[role] || [];
        return allowedRoles.reduce((perms, r) => {
            return [...perms, ...(this.permissions[r] || [])];
        }, []);
    }

    // Validate password
    async validatePassword(password, hashedPassword) {
        return await bcrypt.compare(password, hashedPassword);
    }

    // Hash password
    async hashPassword(password) {
        return await bcrypt.hash(password, 10);
    }

    // Generate secure random token
    generateSecureToken(length = 32) {
        return crypto.randomBytes(length).toString('hex');
    }

    // Create middleware for permission checking
    createPermissionMiddleware(requiredPermission) {
        return (req, res, next) => {
            const userRole = req.user.role;
            
            if (!this.hasPermission(userRole, requiredPermission)) {
                loggingService.logUnauthorizedAccess(
                    req.user.id,
                    requiredPermission,
                    req.ip,
                    req.get('User-Agent')
                );
                
                return res.status(403).json({
                    success: false,
                    message: 'Permission denied'
                });
            }
            
            next();
        };
    }

    // Create middleware for role checking
    createRoleMiddleware(allowedRoles) {
        return (req, res, next) => {
            const userRole = req.user.role;
            
            if (!allowedRoles.some(role => this.roleHierarchy[role].includes(userRole))) {
                loggingService.logUnauthorizedAccess(
                    req.user.id,
                    `role:${allowedRoles.join(',')}`,
                    req.ip,
                    req.get('User-Agent')
                );
                
                return res.status(403).json({
                    success: false,
                    message: 'Role not authorized'
                });
            }
            
            next();
        };
    }

    // Rate limiting check
    async checkRateLimit(identifier, limit, window) {
        const count = await cacheService.incrementRateLimit(identifier, window);
        return count <= limit;
    }

    // Session management
    async createSession(userId, metadata = {}) {
        const sessionId = this.generateSecureToken();
        const session = {
            id: sessionId,
            userId,
            createdAt: new Date(),
            ...metadata
        };

        await cacheService.cacheUserSession(userId, session);
        return sessionId;
    }

    async validateSession(userId, sessionId) {
        const session = await cacheService.getUserSession(userId);
        return session && session.id === sessionId;
    }

    async invalidateSession(userId) {
        await cacheService.invalidateUserSession(userId);
    }

    // Security event logging
    logLoginAttempt(success, user, ip, userAgent) {
        loggingService.logAuthAttempt(success, user._id, ip, userAgent, {
            email: user.email || user.employeeEmail,
            role: user.authorization || 'admin'
        });
    }

    logPasswordReset(userId, ip, userAgent) {
        loggingService.logSecurityEvent('Password reset', {
            userId,
            ip,
            userAgent
        });
    }

    logPermissionChange(userId, oldPermissions, newPermissions, modifiedBy) {
        loggingService.logSecurityEvent('Permission change', {
            userId,
            oldPermissions,
            newPermissions,
            modifiedBy
        });
    }
}

export default new AuthService();
