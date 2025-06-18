import authService from '../services/authService.js';
import loggingService from '../services/loggingService.js';
import cacheService from '../services/cacheService.js';
import monitoringService from '../services/monitoringService.js';
import { Employee } from '../models/index.js';
import Company from '../models/companyModel.js';

// Enhanced authentication middleware with caching and monitoring
export const enhancedAuthMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            loggingService.logSecurityEvent('Missing authentication token', {
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                url: req.url
            });
            
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        // Verify access token
        const decoded = authService.verifyAccessToken(token);
        
        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token.',
                code: 'TOKEN_INVALID'
            });
        }

        // Check if user exists in cache first
        let user = await cacheService.getEmployeeData(decoded.id) || 
                   await cacheService.getCompanyData(decoded.id);

        // If not in cache, fetch from database
        if (!user) {
            if (decoded.role === 'admin') {
                user = await Company.findById(decoded.id);
                if (user) {
                    await cacheService.cacheCompanyData(decoded.id, user);
                }
            } else {
                user = await Employee.findById(decoded.id)
                    .populate('company')
                    .populate('team')
                    .populate('teams')
                    .populate('leadingTeams');
                
                if (user) {
                    await cacheService.cacheEmployeeData(decoded.id, user);
                }
            }
        }

        if (!user) {
            loggingService.logSecurityEvent('User not found for valid token', {
                userId: decoded.id,
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });
            
            return res.status(401).json({
                success: false,
                message: 'User not found.'
            });
        }

        // Add user info to request
        req.user = {
            ...decoded,
            _id: decoded.id,
            userData: user
        };

        // Log successful authentication
        loggingService.logAuthAttempt(true, user, req.ip, req.get('User-Agent'));

        next();
    } catch (error) {
        loggingService.error('Authentication middleware error', error, {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            url: req.url
        });

        monitoringService.trackError(error, {
            middleware: 'enhancedAuthMiddleware',
            ip: req.ip,
            url: req.url
        });

        res.status(500).json({
            success: false,
            message: 'Authentication error.'
        });
    }
};

// Role-based access control middleware
export const rbacMiddleware = (allowedRoles) => {
    return (req, res, next) => {
        try {
            const userRole = req.user.role;
            
            // Check if user role is allowed
            const hasAccess = allowedRoles.some(role => 
                authService.roleHierarchy[role]?.includes(userRole)
            );

            if (!hasAccess) {
                loggingService.logUnauthorizedAccess(
                    req.user.id,
                    `roles:${allowedRoles.join(',')}`,
                    req.ip,
                    req.get('User-Agent')
                );

                return res.status(403).json({
                    success: false,
                    message: 'Access denied. Insufficient permissions.',
                    requiredRoles: allowedRoles,
                    userRole: userRole
                });
            }

            next();
        } catch (error) {
            loggingService.error('RBAC middleware error', error);
            res.status(500).json({
                success: false,
                message: 'Authorization error.'
            });
        }
    };
};

// Permission-based access control middleware
export const permissionMiddleware = (requiredPermission) => {
    return (req, res, next) => {
        try {
            const userRole = req.user.role;
            
            if (!authService.hasPermission(userRole, requiredPermission)) {
                loggingService.logUnauthorizedAccess(
                    req.user.id,
                    `permission:${requiredPermission}`,
                    req.ip,
                    req.get('User-Agent')
                );

                return res.status(403).json({
                    success: false,
                    message: 'Access denied. Missing required permission.',
                    requiredPermission: requiredPermission,
                    userRole: userRole
                });
            }

            next();
        } catch (error) {
            loggingService.error('Permission middleware error', error);
            res.status(500).json({
                success: false,
                message: 'Permission check error.'
            });
        }
    };
};

// Team access middleware (for team-specific resources)
export const teamAccessMiddleware = (req, res, next) => {
    try {
        const userRole = req.user.role;
        const userId = req.user.id;
        const teamId = req.params.teamId || req.body.teamId;

        // Admins have access to all teams
        if (userRole === 'admin') {
            return next();
        }

        // Check if user belongs to the team
        const user = req.user.userData;
        const userTeams = [
            user.team?._id?.toString(),
            ...(user.teams?.map(t => t._id?.toString()) || []),
            ...(user.leadingTeams?.map(t => t._id?.toString()) || [])
        ].filter(Boolean);

        if (!userTeams.includes(teamId)) {
            loggingService.logUnauthorizedAccess(
                userId,
                `team:${teamId}`,
                req.ip,
                req.get('User-Agent')
            );

            return res.status(403).json({
                success: false,
                message: 'Access denied. You do not belong to this team.'
            });
        }

        next();
    } catch (error) {
        loggingService.error('Team access middleware error', error);
        res.status(500).json({
            success: false,
            message: 'Team access check error.'
        });
    }
};

// Company access middleware (for company-specific resources)
export const companyAccessMiddleware = (req, res, next) => {
    try {
        const userRole = req.user.role;
        const userCompany = req.user.company;
        const resourceCompany = req.params.companyId || req.body.companyId;

        // Check if user belongs to the company
        if (userRole !== 'admin' && userCompany !== resourceCompany) {
            loggingService.logUnauthorizedAccess(
                req.user.id,
                `company:${resourceCompany}`,
                req.ip,
                req.get('User-Agent')
            );

            return res.status(403).json({
                success: false,
                message: 'Access denied. You do not belong to this company.'
            });
        }

        next();
    } catch (error) {
        loggingService.error('Company access middleware error', error);
        res.status(500).json({
            success: false,
            message: 'Company access check error.'
        });
    }
};

// Rate limiting middleware
export const rateLimitMiddleware = (limit = 100, window = 3600) => {
    return async (req, res, next) => {
        try {
            const identifier = req.user?.id || req.ip;
            const isAllowed = await authService.checkRateLimit(identifier, limit, window);

            if (!isAllowed) {
                loggingService.logSecurityEvent('Rate limit exceeded', {
                    identifier,
                    limit,
                    window,
                    ip: req.ip,
                    userAgent: req.get('User-Agent')
                });

                return res.status(429).json({
                    success: false,
                    message: 'Rate limit exceeded. Please try again later.',
                    retryAfter: window
                });
            }

            next();
        } catch (error) {
            loggingService.error('Rate limit middleware error', error);
            // Don't block request on rate limit error
            next();
        }
    };
};

// Audit logging middleware
export const auditMiddleware = (action) => {
    return (req, res, next) => {
        // Store original res.json to intercept response
        const originalJson = res.json;
        
        res.json = function(data) {
            // Log the action after successful response
            if (res.statusCode >= 200 && res.statusCode < 300) {
                loggingService.logUserAction(
                    req.user?.id,
                    action,
                    req.originalUrl,
                    {
                        method: req.method,
                        params: req.params,
                        query: req.query,
                        body: req.body,
                        statusCode: res.statusCode,
                        ip: req.ip,
                        userAgent: req.get('User-Agent')
                    }
                );
            }
            
            return originalJson.call(this, data);
        };

        next();
    };
};

// Session validation middleware
export const sessionMiddleware = async (req, res, next) => {
    try {
        const sessionId = req.header('X-Session-ID');
        
        if (sessionId && req.user) {
            const isValidSession = await authService.validateSession(req.user.id, sessionId);
            
            if (!isValidSession) {
                loggingService.logSecurityEvent('Invalid session', {
                    userId: req.user.id,
                    sessionId,
                    ip: req.ip
                });

                return res.status(401).json({
                    success: false,
                    message: 'Invalid session. Please login again.',
                    code: 'SESSION_INVALID'
                });
            }
        }

        next();
    } catch (error) {
        loggingService.error('Session middleware error', error);
        next(); // Don't block request on session error
    }
};

// Combine multiple middleware for convenience
export const createSecureRoute = (options = {}) => {
    const middleware = [enhancedAuthMiddleware];

    if (options.roles) {
        middleware.push(rbacMiddleware(options.roles));
    }

    if (options.permission) {
        middleware.push(permissionMiddleware(options.permission));
    }

    if (options.teamAccess) {
        middleware.push(teamAccessMiddleware);
    }

    if (options.companyAccess) {
        middleware.push(companyAccessMiddleware);
    }

    if (options.rateLimit) {
        middleware.push(rateLimitMiddleware(options.rateLimit.limit, options.rateLimit.window));
    }

    if (options.audit) {
        middleware.push(auditMiddleware(options.audit));
    }

    if (options.session) {
        middleware.push(sessionMiddleware);
    }

    return middleware;
};

export default {
    enhancedAuthMiddleware,
    rbacMiddleware,
    permissionMiddleware,
    teamAccessMiddleware,
    companyAccessMiddleware,
    rateLimitMiddleware,
    auditMiddleware,
    sessionMiddleware,
    createSecureRoute
};
