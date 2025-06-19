import express from 'express';
import authService from '../services/authService.js';
import loggingService from '../services/loggingService.js';
import cacheService from '../services/cacheService.js';
import { enhancedAuthMiddleware, rateLimitMiddleware } from '../middleware/enhancedAuthMiddleware.js';
import { Employee } from '../models/index.js';
import Company from '../models/companyModel.js';

const router = express.Router();

// Refresh token endpoint
router.post('/refresh', rateLimitMiddleware(10, 900), async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token is required'
            });
        }

        // Verify refresh token
        const decoded = await authService.verifyRefreshToken(refreshToken);
        if (!decoded) {
            loggingService.logSecurityEvent('Invalid refresh token used', {
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });

            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token',
                code: 'REFRESH_TOKEN_INVALID'
            });
        }

        // Get user data
        let user = await cacheService.getEmployeeData(decoded.id) || 
                   await cacheService.getCompanyData(decoded.id);

        if (!user) {
            // Fetch from database
            user = await Employee.findById(decoded.id) || 
                   await Company.findById(decoded.id);

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Cache user data
            if (user.authorization) {
                await cacheService.cacheEmployeeData(decoded.id, user);
            } else {
                await cacheService.cacheCompanyData(decoded.id, user);
            }
        }

        // Generate new access token
        const newAccessToken = authService.generateAccessToken(user);

        loggingService.logSecurityEvent('Token refreshed', {
            userId: decoded.id,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.json({
            success: true,
            message: 'Token refreshed successfully',
            data: {
                accessToken: newAccessToken,
                user: {
                    id: user._id,
                    email: user.email || user.employeeEmail,
                    role: user.authorization || 'admin'
                }
            }
        });

    } catch (error) {
        loggingService.error('Token refresh error', error, {
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.status(500).json({
            success: false,
            message: 'Token refresh failed'
        });
    }
});

// Logout endpoint
router.post('/logout', enhancedAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        // Invalidate refresh token
        await authService.invalidateRefreshToken(userId);

        // Invalidate session
        await authService.invalidateSession(userId);

        // Clear user cache
        await cacheService.invalidateEmployeeData(userId);
        await cacheService.invalidateCompanyData(userId);

        loggingService.logSecurityEvent('User logged out', {
            userId,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.json({
            success: true,
            message: 'Logged out successfully'
        });

    } catch (error) {
        loggingService.error('Logout error', error);
        res.status(500).json({
            success: false,
            message: 'Logout failed'
        });
    }
});

// Validate token endpoint
router.get('/validate', enhancedAuthMiddleware, async (req, res) => {
    try {
        const user = req.user;
        const permissions = authService.getRolePermissions(user.role);

        res.json({
            success: true,
            message: 'Token is valid',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    company: user.company,
                    team: user.team
                },
                permissions
            }
        });

    } catch (error) {
        loggingService.error('Token validation error', error);
        res.status(500).json({
            success: false,
            message: 'Token validation failed'
        });
    }
});

// Get user permissions
router.get('/permissions', enhancedAuthMiddleware, async (req, res) => {
    try {
        const userRole = req.user.role;
        const permissions = authService.getRolePermissions(userRole);

        res.json({
            success: true,
            data: {
                role: userRole,
                permissions
            }
        });

    } catch (error) {
        loggingService.error('Get permissions error', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get permissions'
        });
    }
});

// Change password endpoint
router.post('/change-password', enhancedAuthMiddleware, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;
        const userRole = req.user.role;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password are required'
            });
        }

        // Get user from database
        let user;
        if (userRole === 'admin') {
            user = await Company.findById(userId);
        } else {
            user = await Employee.findById(userId);
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Validate current password
        const isValidPassword = await authService.validatePassword(
            currentPassword, 
            user.password
        );

        if (!isValidPassword) {
            loggingService.logSecurityEvent('Invalid password change attempt', {
                userId,
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });

            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Hash new password
        const hashedPassword = await authService.hashPassword(newPassword);

        // Update password
        user.password = hashedPassword;
        await user.save();

        // Invalidate all sessions and tokens
        await authService.invalidateRefreshToken(userId);
        await authService.invalidateSession(userId);
        await cacheService.invalidateEmployeeData(userId);
        await cacheService.invalidateCompanyData(userId);

        loggingService.logSecurityEvent('Password changed', {
            userId,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.json({
            success: true,
            message: 'Password changed successfully. Please login again.'
        });

    } catch (error) {
        loggingService.error('Change password error', error);
        res.status(500).json({
            success: false,
            message: 'Password change failed'
        });
    }
});

// Get active sessions
router.get('/sessions', enhancedAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const session = await cacheService.getUserSession(userId);

        res.json({
            success: true,
            data: {
                currentSession: session,
                sessionCount: session ? 1 : 0
            }
        });

    } catch (error) {
        loggingService.error('Get sessions error', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get sessions'
        });
    }
});

// Revoke all sessions
router.post('/revoke-sessions', enhancedAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        // Invalidate all tokens and sessions
        await authService.invalidateRefreshToken(userId);
        await authService.invalidateSession(userId);
        await cacheService.invalidateEmployeeData(userId);
        await cacheService.invalidateCompanyData(userId);

        loggingService.logSecurityEvent('All sessions revoked', {
            userId,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.json({
            success: true,
            message: 'All sessions revoked successfully'
        });

    } catch (error) {
        loggingService.error('Revoke sessions error', error);
        res.status(500).json({
            success: false,
            message: 'Failed to revoke sessions'
        });
    }
});

export default router;
