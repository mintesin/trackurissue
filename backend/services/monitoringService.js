import os from 'os';
import process from 'process';
import mongoose from 'mongoose';
import loggingService from './loggingService.js';
import cacheService from './cacheService.js';

class MonitoringService {
    constructor() {
        this.metrics = {
            requests: {
                total: 0,
                success: 0,
                errors: 0,
                responseTime: []
            },
            database: {
                queries: 0,
                slowQueries: 0,
                errors: 0,
                connectionPool: 0
            },
            cache: {
                hits: 0,
                misses: 0,
                errors: 0
            },
            system: {
                memory: {},
                cpu: {},
                uptime: 0
            }
        };

        this.alerts = [];
        this.thresholds = {
            responseTime: 1000, // ms
            errorRate: 0.05, // 5%
            memoryUsage: 0.85, // 85%
            cpuUsage: 0.80, // 80%
            dbConnectionPool: 0.90 // 90%
        };

        this.startTime = Date.now();
        this.initializeMonitoring();
    }

    initializeMonitoring() {
        // Start periodic system monitoring
        setInterval(() => {
            this.collectSystemMetrics();
        }, 30000); // Every 30 seconds

        // Start periodic health checks
        setInterval(() => {
            this.performHealthChecks();
        }, 60000); // Every minute

        // Start periodic metric aggregation
        setInterval(() => {
            this.aggregateMetrics();
        }, 300000); // Every 5 minutes
    }

    // Request monitoring
    trackRequest(method, url, statusCode, responseTime, userId = null) {
        this.metrics.requests.total++;
        
        if (statusCode >= 200 && statusCode < 400) {
            this.metrics.requests.success++;
        } else {
            this.metrics.requests.errors++;
        }

        this.metrics.requests.responseTime.push(responseTime);

        // Keep only last 1000 response times
        if (this.metrics.requests.responseTime.length > 1000) {
            this.metrics.requests.responseTime = this.metrics.requests.responseTime.slice(-1000);
        }

        // Check for slow requests
        if (responseTime > this.thresholds.responseTime) {
            this.createAlert('slow_request', {
                method,
                url,
                responseTime,
                userId
            });
        }

        // Log to performance logger
        loggingService.logAPIResponse(method, url, statusCode, responseTime, userId);
    }

    // Database monitoring
    trackDatabaseQuery(operation, collection, duration, success = true) {
        this.metrics.database.queries++;
        
        if (!success) {
            this.metrics.database.errors++;
        }

        if (duration > 100) { // Slow query threshold: 100ms
            this.metrics.database.slowQueries++;
            loggingService.logSlowQuery(operation, duration, collection);
        }

        loggingService.logDatabaseOperation(operation, collection, duration);
    }

    // Cache monitoring
    trackCacheOperation(operation, hit = false) {
        if (hit) {
            this.metrics.cache.hits++;
        } else {
            this.metrics.cache.misses++;
        }
    }

    trackCacheError() {
        this.metrics.cache.errors++;
    }

    // System metrics collection
    collectSystemMetrics() {
        try {
            // Memory metrics
            const memUsage = process.memoryUsage();
            const totalMem = os.totalmem();
            const freeMem = os.freemem();
            const usedMem = totalMem - freeMem;

            this.metrics.system.memory = {
                total: totalMem,
                used: usedMem,
                free: freeMem,
                usage: usedMem / totalMem,
                heap: {
                    used: memUsage.heapUsed,
                    total: memUsage.heapTotal,
                    usage: memUsage.heapUsed / memUsage.heapTotal
                },
                external: memUsage.external,
                rss: memUsage.rss
            };

            // CPU metrics
            const cpus = os.cpus();
            this.metrics.system.cpu = {
                count: cpus.length,
                model: cpus[0].model,
                loadAverage: os.loadavg()
            };

            // Uptime
            this.metrics.system.uptime = process.uptime();

            // Check thresholds
            this.checkSystemThresholds();

        } catch (error) {
            loggingService.error('Failed to collect system metrics', error);
        }
    }

    // Health checks
    async performHealthChecks() {
        const healthStatus = {
            timestamp: new Date().toISOString(),
            status: 'healthy',
            checks: {}
        };

        try {
            // Database health check
            healthStatus.checks.database = await this.checkDatabaseHealth();
            
            // Cache health check
            healthStatus.checks.cache = await this.checkCacheHealth();
            
            // System health check
            healthStatus.checks.system = this.checkSystemHealth();

            // Overall status
            const allHealthy = Object.values(healthStatus.checks).every(check => check.status === 'healthy');
            healthStatus.status = allHealthy ? 'healthy' : 'unhealthy';

            // Cache health status
            await cacheService.cache('health:status', healthStatus, 300); // 5 minutes

            if (!allHealthy) {
                this.createAlert('health_check_failed', healthStatus);
            }

        } catch (error) {
            loggingService.error('Health check failed', error);
            healthStatus.status = 'error';
            healthStatus.error = error.message;
        }

        return healthStatus;
    }

    async checkDatabaseHealth() {
        try {
            const start = Date.now();
            await mongoose.connection.db.admin().ping();
            const duration = Date.now() - start;

            const connectionState = mongoose.connection.readyState;
            const connectionStates = {
                0: 'disconnected',
                1: 'connected',
                2: 'connecting',
                3: 'disconnecting'
            };

            return {
                status: connectionState === 1 ? 'healthy' : 'unhealthy',
                responseTime: duration,
                connectionState: connectionStates[connectionState],
                connections: mongoose.connection.db.serverConfig?.connections?.length || 0
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                error: error.message
            };
        }
    }

    async checkCacheHealth() {
        try {
            const healthy = await cacheService.healthCheck();
            return {
                status: healthy ? 'healthy' : 'unhealthy'
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                error: error.message
            };
        }
    }

    checkSystemHealth() {
        const memUsage = this.metrics.system.memory.usage || 0;
        const loadAvg = this.metrics.system.cpu.loadAverage?.[0] || 0;
        const cpuCount = this.metrics.system.cpu.count || 1;
        const cpuUsage = loadAvg / cpuCount;

        const issues = [];
        
        if (memUsage > this.thresholds.memoryUsage) {
            issues.push(`High memory usage: ${(memUsage * 100).toFixed(1)}%`);
        }
        
        if (cpuUsage > this.thresholds.cpuUsage) {
            issues.push(`High CPU usage: ${(cpuUsage * 100).toFixed(1)}%`);
        }

        return {
            status: issues.length === 0 ? 'healthy' : 'warning',
            memoryUsage: memUsage,
            cpuUsage: cpuUsage,
            issues: issues
        };
    }

    // Threshold checking
    checkSystemThresholds() {
        const memUsage = this.metrics.system.memory.usage;
        const loadAvg = this.metrics.system.cpu.loadAverage?.[0] || 0;
        const cpuCount = this.metrics.system.cpu.count || 1;
        const cpuUsage = loadAvg / cpuCount;

        if (memUsage > this.thresholds.memoryUsage) {
            this.createAlert('high_memory_usage', {
                usage: memUsage,
                threshold: this.thresholds.memoryUsage
            });
        }

        if (cpuUsage > this.thresholds.cpuUsage) {
            this.createAlert('high_cpu_usage', {
                usage: cpuUsage,
                threshold: this.thresholds.cpuUsage
            });
        }
    }

    // Error tracking
    trackError(error, context = {}) {
        const errorData = {
            message: error.message,
            stack: error.stack,
            name: error.name,
            timestamp: new Date().toISOString(),
            context
        };

        // Log error
        loggingService.error('Application Error', error, context);

        // Create alert for critical errors
        if (this.isCriticalError(error)) {
            this.createAlert('critical_error', errorData);
        }

        // Track error rate
        this.checkErrorRate();
    }

    isCriticalError(error) {
        const criticalErrors = [
            'MongoError',
            'ValidationError',
            'CastError',
            'ReferenceError',
            'TypeError'
        ];
        
        return criticalErrors.includes(error.name) || 
               error.message.includes('ECONNREFUSED') ||
               error.message.includes('timeout');
    }

    checkErrorRate() {
        const total = this.metrics.requests.total;
        const errors = this.metrics.requests.errors;
        
        if (total > 100) { // Only check after 100 requests
            const errorRate = errors / total;
            if (errorRate > this.thresholds.errorRate) {
                this.createAlert('high_error_rate', {
                    errorRate,
                    threshold: this.thresholds.errorRate,
                    totalRequests: total,
                    errorCount: errors
                });
            }
        }
    }

    // Alert management
    createAlert(type, data) {
        const alert = {
            id: this.generateAlertId(),
            type,
            severity: this.getAlertSeverity(type),
            message: this.getAlertMessage(type, data),
            data,
            timestamp: new Date().toISOString(),
            resolved: false
        };

        this.alerts.push(alert);
        
        // Keep only last 100 alerts
        if (this.alerts.length > 100) {
            this.alerts = this.alerts.slice(-100);
        }

        // Log alert
        loggingService.warn(`Alert: ${alert.message}`, alert);

        // Cache alert for dashboard
        cacheService.cache(`alert:${alert.id}`, alert, 3600);

        return alert;
    }

    getAlertSeverity(type) {
        const severityMap = {
            slow_request: 'warning',
            high_memory_usage: 'warning',
            high_cpu_usage: 'warning',
            high_error_rate: 'critical',
            critical_error: 'critical',
            health_check_failed: 'critical'
        };
        
        return severityMap[type] || 'info';
    }

    getAlertMessage(type, data) {
        const messageMap = {
            slow_request: `Slow request detected: ${data.method} ${data.url} took ${data.responseTime}ms`,
            high_memory_usage: `High memory usage: ${(data.usage * 100).toFixed(1)}%`,
            high_cpu_usage: `High CPU usage: ${(data.usage * 100).toFixed(1)}%`,
            high_error_rate: `High error rate: ${(data.errorRate * 100).toFixed(1)}%`,
            critical_error: `Critical error: ${data.message}`,
            health_check_failed: 'Health check failed'
        };
        
        return messageMap[type] || `Alert: ${type}`;
    }

    generateAlertId() {
        return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Metrics aggregation
    aggregateMetrics() {
        const aggregated = {
            timestamp: new Date().toISOString(),
            requests: {
                total: this.metrics.requests.total,
                success: this.metrics.requests.success,
                errors: this.metrics.requests.errors,
                successRate: this.metrics.requests.total > 0 ? 
                    this.metrics.requests.success / this.metrics.requests.total : 0,
                errorRate: this.metrics.requests.total > 0 ? 
                    this.metrics.requests.errors / this.metrics.requests.total : 0,
                avgResponseTime: this.calculateAverageResponseTime(),
                p95ResponseTime: this.calculatePercentileResponseTime(95),
                p99ResponseTime: this.calculatePercentileResponseTime(99)
            },
            database: { ...this.metrics.database },
            cache: {
                ...this.metrics.cache,
                hitRate: this.metrics.cache.hits + this.metrics.cache.misses > 0 ?
                    this.metrics.cache.hits / (this.metrics.cache.hits + this.metrics.cache.misses) : 0
            },
            system: { ...this.metrics.system }
        };

        // Cache aggregated metrics
        cacheService.cache('metrics:aggregated', aggregated, 300);

        // Log metrics
        loggingService.info('Metrics aggregated', aggregated);

        return aggregated;
    }

    calculateAverageResponseTime() {
        const times = this.metrics.requests.responseTime;
        if (times.length === 0) return 0;
        return times.reduce((sum, time) => sum + time, 0) / times.length;
    }

    calculatePercentileResponseTime(percentile) {
        const times = [...this.metrics.requests.responseTime].sort((a, b) => a - b);
        if (times.length === 0) return 0;
        const index = Math.ceil((percentile / 100) * times.length) - 1;
        return times[index] || 0;
    }

    // Public API methods
    getMetrics() {
        return this.aggregateMetrics();
    }

    getAlerts(severity = null) {
        if (severity) {
            return this.alerts.filter(alert => alert.severity === severity && !alert.resolved);
        }
        return this.alerts.filter(alert => !alert.resolved);
    }

    resolveAlert(alertId) {
        const alert = this.alerts.find(a => a.id === alertId);
        if (alert) {
            alert.resolved = true;
            alert.resolvedAt = new Date().toISOString();
        }
        return alert;
    }

    // Middleware for request monitoring
    createMonitoringMiddleware() {
        return (req, res, next) => {
            const startTime = Date.now();

            res.on('finish', () => {
                const duration = Date.now() - startTime;
                this.trackRequest(
                    req.method,
                    req.url,
                    res.statusCode,
                    duration,
                    req.user?.id
                );
            });

            next();
        };
    }
}

export default new MonitoringService();
