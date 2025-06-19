import express from 'express';
import monitoringService from '../services/monitoringService.js';
import cacheService from '../services/cacheService.js';
import loggingService from '../services/loggingService.js';
import { createSecureRoute } from '../middleware/enhancedAuthMiddleware.js';

const router = express.Router();

// Health check endpoint (public)
router.get('/health', async (req, res) => {
    try {
        const healthStatus = await monitoringService.performHealthChecks();
        
        const statusCode = healthStatus.status === 'healthy' ? 200 : 503;
        
        res.status(statusCode).json({
            success: healthStatus.status === 'healthy',
            data: healthStatus
        });
    } catch (error) {
        loggingService.error('Health check endpoint error', error);
        res.status(500).json({
            success: false,
            message: 'Health check failed',
            status: 'error'
        });
    }
});

// Metrics endpoint (admin only)
router.get('/metrics', 
    ...createSecureRoute({ 
        roles: ['admin'], 
        rateLimit: { limit: 60, window: 3600 } 
    }),
    async (req, res) => {
        try {
            const metrics = monitoringService.getMetrics();
            
            res.json({
                success: true,
                data: metrics
            });
        } catch (error) {
            loggingService.error('Metrics endpoint error', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get metrics'
            });
        }
    }
);

// Alerts endpoint (admin only)
router.get('/alerts', 
    ...createSecureRoute({ 
        roles: ['admin'], 
        rateLimit: { limit: 100, window: 3600 } 
    }),
    async (req, res) => {
        try {
            const { severity } = req.query;
            const alerts = monitoringService.getAlerts(severity);
            
            res.json({
                success: true,
                data: {
                    alerts,
                    count: alerts.length
                }
            });
        } catch (error) {
            loggingService.error('Alerts endpoint error', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get alerts'
            });
        }
    }
);

// Resolve alert endpoint (admin only)
router.post('/alerts/:alertId/resolve', 
    ...createSecureRoute({ 
        roles: ['admin'], 
        audit: 'resolve_alert' 
    }),
    async (req, res) => {
        try {
            const { alertId } = req.params;
            const alert = monitoringService.resolveAlert(alertId);
            
            if (!alert) {
                return res.status(404).json({
                    success: false,
                    message: 'Alert not found'
                });
            }
            
            res.json({
                success: true,
                message: 'Alert resolved successfully',
                data: alert
            });
        } catch (error) {
            loggingService.error('Resolve alert endpoint error', error);
            res.status(500).json({
                success: false,
                message: 'Failed to resolve alert'
            });
        }
    }
);

// System info endpoint (admin only)
router.get('/system', 
    ...createSecureRoute({ 
        roles: ['admin'], 
        rateLimit: { limit: 30, window: 3600 } 
    }),
    async (req, res) => {
        try {
            const systemInfo = {
                node: {
                    version: process.version,
                    platform: process.platform,
                    arch: process.arch,
                    uptime: process.uptime(),
                    pid: process.pid
                },
                memory: process.memoryUsage(),
                environment: process.env.NODE_ENV || 'development',
                timestamp: new Date().toISOString()
            };
            
            res.json({
                success: true,
                data: systemInfo
            });
        } catch (error) {
            loggingService.error('System info endpoint error', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get system info'
            });
        }
    }
);

// Cache stats endpoint (admin only)
router.get('/cache/stats', 
    ...createSecureRoute({ 
        roles: ['admin'], 
        rateLimit: { limit: 60, window: 3600 } 
    }),
    async (req, res) => {
        try {
            const cacheHealth = await cacheService.healthCheck();
            
            res.json({
                success: true,
                data: {
                    healthy: cacheHealth,
                    hits: monitoringService.metrics.cache.hits,
                    misses: monitoringService.metrics.cache.misses,
                    errors: monitoringService.metrics.cache.errors,
                    hitRate: monitoringService.metrics.cache.hits + monitoringService.metrics.cache.misses > 0 ?
                        monitoringService.metrics.cache.hits / (monitoringService.metrics.cache.hits + monitoringService.metrics.cache.misses) : 0
                }
            });
        } catch (error) {
            loggingService.error('Cache stats endpoint error', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get cache stats'
            });
        }
    }
);

// Clear cache endpoint (admin only)
router.post('/cache/clear', 
    ...createSecureRoute({ 
        roles: ['admin'], 
        audit: 'clear_cache' 
    }),
    async (req, res) => {
        try {
            const { pattern } = req.body;
            
            if (pattern) {
                await cacheService.invalidateByPattern(pattern);
            } else {
                // Clear all application cache (be careful with this)
                await cacheService.invalidateByPattern('trackurissue:*');
            }
            
            loggingService.info('Cache cleared', { 
                pattern: pattern || 'all',
                userId: req.user.id 
            });
            
            res.json({
                success: true,
                message: 'Cache cleared successfully'
            });
        } catch (error) {
            loggingService.error('Clear cache endpoint error', error);
            res.status(500).json({
                success: false,
                message: 'Failed to clear cache'
            });
        }
    }
);

// Performance metrics endpoint (admin only)
router.get('/performance', 
    ...createSecureRoute({ 
        roles: ['admin'], 
        rateLimit: { limit: 60, window: 3600 } 
    }),
    async (req, res) => {
        try {
            const { timeframe = '1h' } = req.query;
            
            // Get cached performance data
            const performanceData = await cacheService.retrieve('metrics:aggregated');
            
            if (!performanceData) {
                return res.json({
                    success: true,
                    data: {
                        message: 'No performance data available yet'
                    }
                });
            }
            
            res.json({
                success: true,
                data: {
                    timeframe,
                    metrics: performanceData,
                    timestamp: new Date().toISOString()
                }
            });
        } catch (error) {
            loggingService.error('Performance endpoint error', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get performance data'
            });
        }
    }
);

// Database performance endpoint (admin only)
router.get('/database/performance', 
    ...createSecureRoute({ 
        roles: ['admin'], 
        rateLimit: { limit: 30, window: 3600 } 
    }),
    async (req, res) => {
        try {
            const dbMetrics = {
                queries: monitoringService.metrics.database.queries,
                slowQueries: monitoringService.metrics.database.slowQueries,
                errors: monitoringService.metrics.database.errors,
                slowQueryRate: monitoringService.metrics.database.queries > 0 ?
                    monitoringService.metrics.database.slowQueries / monitoringService.metrics.database.queries : 0,
                errorRate: monitoringService.metrics.database.queries > 0 ?
                    monitoringService.metrics.database.errors / monitoringService.metrics.database.queries : 0
            };
            
            res.json({
                success: true,
                data: dbMetrics
            });
        } catch (error) {
            loggingService.error('Database performance endpoint error', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get database performance data'
            });
        }
    }
);

// Security events endpoint (admin only)
router.get('/security/events', 
    ...createSecureRoute({ 
        roles: ['admin'], 
        rateLimit: { limit: 50, window: 3600 } 
    }),
    async (req, res) => {
        try {
            const { limit = 50, severity } = req.query;
            
            // This would typically come from a security events store
            // For now, we'll return a placeholder response
            res.json({
                success: true,
                data: {
                    events: [],
                    message: 'Security events are logged to files. Check security.log for detailed events.'
                }
            });
        } catch (error) {
            loggingService.error('Security events endpoint error', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get security events'
            });
        }
    }
);

// User activity analytics endpoint (admin only)
router.get('/analytics/users', 
    ...createSecureRoute({ 
        roles: ['admin'], 
        rateLimit: { limit: 30, window: 3600 } 
    }),
    async (req, res) => {
        try {
            const { timeframe = '24h' } = req.query;
            
            // Get basic user activity metrics
            const userMetrics = {
                totalRequests: monitoringService.metrics.requests.total,
                uniqueUsers: 0, // Would need to implement user tracking
                activeUsers: 0, // Would need to implement active user tracking
                timeframe,
                timestamp: new Date().toISOString()
            };
            
            res.json({
                success: true,
                data: userMetrics
            });
        } catch (error) {
            loggingService.error('User analytics endpoint error', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get user analytics'
            });
        }
    }
);

// Export logs endpoint (admin only)
router.get('/logs/export', 
    ...createSecureRoute({ 
        roles: ['admin'], 
        rateLimit: { limit: 5, window: 3600 } 
    }),
    async (req, res) => {
        try {
            const { type = 'app', lines = 100 } = req.query;
            
            // This would typically read from log files
            // For security reasons, we'll return a limited response
            res.json({
                success: true,
                data: {
                    message: 'Log export functionality would be implemented here',
                    type,
                    lines,
                    note: 'Logs are stored in the /logs directory'
                }
            });
        } catch (error) {
            loggingService.error('Log export endpoint error', error);
            res.status(500).json({
                success: false,
                message: 'Failed to export logs'
            });
        }
    }
);

export default router;
