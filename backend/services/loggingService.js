import winston from 'winston';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Custom format for logs
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
        let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
        
        if (Object.keys(meta).length > 0) {
            log += ` | Meta: ${JSON.stringify(meta)}`;
        }
        
        if (stack) {
            log += ` | Stack: ${stack}`;
        }
        
        return log;
    })
);

// Create different loggers for different purposes
class LoggingService {
    constructor() {
        this.initializeLoggers();
    }

    initializeLoggers() {
        // Application Logger
        this.appLogger = winston.createLogger({
            level: process.env.LOG_LEVEL || 'info',
            format: logFormat,
            transports: [
                new winston.transports.File({
                    filename: path.join(logsDir, 'app-error.log'),
                    level: 'error',
                    maxsize: 5242880, // 5MB
                    maxFiles: 5,
                }),
                new winston.transports.File({
                    filename: path.join(logsDir, 'app-combined.log'),
                    maxsize: 5242880, // 5MB
                    maxFiles: 5,
                }),
            ],
        });

        // Security Logger
        this.securityLogger = winston.createLogger({
            level: 'info',
            format: logFormat,
            transports: [
                new winston.transports.File({
                    filename: path.join(logsDir, 'security.log'),
                    maxsize: 5242880, // 5MB
                    maxFiles: 10,
                }),
            ],
        });

        // Performance Logger
        this.performanceLogger = winston.createLogger({
            level: 'info',
            format: logFormat,
            transports: [
                new winston.transports.File({
                    filename: path.join(logsDir, 'performance.log'),
                    maxsize: 5242880, // 5MB
                    maxFiles: 5,
                }),
            ],
        });

        // Audit Logger
        this.auditLogger = winston.createLogger({
            level: 'info',
            format: logFormat,
            transports: [
                new winston.transports.File({
                    filename: path.join(logsDir, 'audit.log'),
                    maxsize: 10485760, // 10MB
                    maxFiles: 10,
                }),
            ],
        });

        // Database Logger
        this.dbLogger = winston.createLogger({
            level: 'info',
            format: logFormat,
            transports: [
                new winston.transports.File({
                    filename: path.join(logsDir, 'database.log'),
                    maxsize: 5242880, // 5MB
                    maxFiles: 5,
                }),
            ],
        });

        // Add console transport in development
        if (process.env.NODE_ENV !== 'production') {
            const consoleTransport = new winston.transports.Console({
                format: winston.format.combine(
                    winston.format.colorize(),
                    winston.format.simple()
                )
            });

            this.appLogger.add(consoleTransport);
            this.securityLogger.add(consoleTransport);
            this.performanceLogger.add(consoleTransport);
        }
    }

    // Application logging methods
    info(message, meta = {}) {
        this.appLogger.info(message, meta);
    }

    warn(message, meta = {}) {
        this.appLogger.warn(message, meta);
    }

    error(message, error = null, meta = {}) {
        const logData = { ...meta };
        if (error) {
            logData.error = {
                message: error.message,
                stack: error.stack,
                name: error.name
            };
        }
        this.appLogger.error(message, logData);
    }

    debug(message, meta = {}) {
        this.appLogger.debug(message, meta);
    }

    // Security logging
    logSecurityEvent(event, details = {}) {
        this.securityLogger.info(`Security Event: ${event}`, {
            event,
            timestamp: new Date().toISOString(),
            ...details
        });
    }

    logAuthAttempt(success, userId, ip, userAgent, details = {}) {
        this.securityLogger.info(`Authentication ${success ? 'Success' : 'Failure'}`, {
            success,
            userId,
            ip,
            userAgent,
            timestamp: new Date().toISOString(),
            ...details
        });
    }

    logUnauthorizedAccess(userId, resource, ip, userAgent) {
        this.securityLogger.warn('Unauthorized Access Attempt', {
            userId,
            resource,
            ip,
            userAgent,
            timestamp: new Date().toISOString()
        });
    }

    logSuspiciousActivity(activity, details = {}) {
        this.securityLogger.warn(`Suspicious Activity: ${activity}`, {
            activity,
            timestamp: new Date().toISOString(),
            ...details
        });
    }

    // Performance logging
    logPerformance(operation, duration, details = {}) {
        this.performanceLogger.info(`Performance: ${operation}`, {
            operation,
            duration,
            timestamp: new Date().toISOString(),
            ...details
        });
    }

    logSlowQuery(query, duration, collection = null) {
        this.performanceLogger.warn('Slow Database Query', {
            query,
            duration,
            collection,
            timestamp: new Date().toISOString()
        });
    }

    logAPIResponse(method, url, statusCode, duration, userId = null) {
        this.performanceLogger.info('API Response', {
            method,
            url,
            statusCode,
            duration,
            userId,
            timestamp: new Date().toISOString()
        });
    }

    // Audit logging
    logUserAction(userId, action, resource, details = {}) {
        this.auditLogger.info('User Action', {
            userId,
            action,
            resource,
            timestamp: new Date().toISOString(),
            ...details
        });
    }

    logDataChange(userId, operation, collection, documentId, changes = {}) {
        this.auditLogger.info('Data Change', {
            userId,
            operation,
            collection,
            documentId,
            changes,
            timestamp: new Date().toISOString()
        });
    }

    logSystemEvent(event, details = {}) {
        this.auditLogger.info(`System Event: ${event}`, {
            event,
            timestamp: new Date().toISOString(),
            ...details
        });
    }

    // Database logging
    logDatabaseOperation(operation, collection, duration, details = {}) {
        this.dbLogger.info(`DB Operation: ${operation}`, {
            operation,
            collection,
            duration,
            timestamp: new Date().toISOString(),
            ...details
        });
    }

    logDatabaseError(operation, collection, error, details = {}) {
        this.dbLogger.error(`DB Error: ${operation}`, {
            operation,
            collection,
            error: {
                message: error.message,
                stack: error.stack
            },
            timestamp: new Date().toISOString(),
            ...details
        });
    }

    logDatabaseConnection(event, details = {}) {
        this.dbLogger.info(`DB Connection: ${event}`, {
            event,
            timestamp: new Date().toISOString(),
            ...details
        });
    }

    // Request logging middleware
    createRequestLogger() {
        return (req, res, next) => {
            const startTime = Date.now();
            
            // Log request
            this.info('Incoming Request', {
                method: req.method,
                url: req.url,
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                userId: req.user?.id || req.user?._id,
                timestamp: new Date().toISOString()
            });

            // Override res.end to log response
            const originalEnd = res.end;
            res.end = function(...args) {
                const duration = Date.now() - startTime;
                
                // Log API response performance
                loggingService.logAPIResponse(
                    req.method,
                    req.url,
                    res.statusCode,
                    duration,
                    req.user?.id || req.user?._id
                );

                // Log slow requests
                if (duration > 1000) {
                    loggingService.warn('Slow Request', {
                        method: req.method,
                        url: req.url,
                        duration,
                        statusCode: res.statusCode
                    });
                }

                originalEnd.apply(this, args);
            };

            next();
        };
    }

    // Error logging middleware
    createErrorLogger() {
        return (error, req, res, next) => {
            this.error('Request Error', error, {
                method: req.method,
                url: req.url,
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                userId: req.user?.id || req.user?._id,
                body: req.body,
                params: req.params,
                query: req.query
            });

            next(error);
        };
    }

    // Health check
    async healthCheck() {
        try {
            this.info('Health check performed');
            return true;
        } catch (error) {
            this.error('Health check failed', error);
            return false;
        }
    }
}

// Create singleton instance
const loggingService = new LoggingService();

export default loggingService;
