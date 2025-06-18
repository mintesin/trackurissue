import winston from 'winston';

// Custom format for Heroku logging
const herokuFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
    // Heroku captures timestamps automatically, so we don't need to add them
    let msg = `${level}: ${message}`;
    
    // Add metadata if present
    if (Object.keys(metadata).length > 0) {
        msg += ` ${JSON.stringify(metadata)}`;
    }
    
    return msg;
});

// Create Heroku-optimized logger
const createHerokuLogger = () => {
    const logger = winston.createLogger({
        level: process.env.LOG_LEVEL || 'info',
        format: winston.format.combine(
            winston.format.errors({ stack: true }),
            winston.format.metadata(),
            herokuFormat
        ),
        transports: [
            // Console transport (Heroku captures stdout/stderr)
            new winston.transports.Console({
                format: winston.format.combine(
                    winston.format.colorize(),
                    herokuFormat
                )
            })
        ],
        // Handle uncaught exceptions and unhandled rejections
        exceptionHandlers: [
            new winston.transports.Console({
                format: winston.format.combine(
                    winston.format.colorize(),
                    winston.format.errors({ stack: true }),
                    herokuFormat
                )
            })
        ],
        rejectionHandlers: [
            new winston.transports.Console({
                format: winston.format.combine(
                    winston.format.colorize(),
                    winston.format.errors({ stack: true }),
                    herokuFormat
                )
            })
        ]
    });

    // Add request logging format
    logger.requestFormat = (req, res) => {
        return {
            method: req.method,
            url: req.url,
            status: res.statusCode,
            responseTime: res.get('X-Response-Time'),
            userAgent: req.get('User-Agent'),
            ip: req.ip,
            userId: req.user?.id
        };
    };

    // Add performance logging format
    logger.performanceFormat = (operation, duration, metadata = {}) => {
        return {
            operation,
            duration,
            ...metadata
        };
    };

    // Add security event format
    logger.securityFormat = (event, metadata = {}) => {
        return {
            event,
            timestamp: new Date().toISOString(),
            ...metadata
        };
    };

    // Add error logging with context
    logger.errorWithContext = (message, error, context = {}) => {
        logger.error(message, {
            error: {
                message: error.message,
                stack: error.stack,
                ...error
            },
            ...context
        });
    };

    return logger;
};

// Create logger instance
const herokuLogger = createHerokuLogger();

// Export logging middleware
export const requestLoggingMiddleware = (req, res, next) => {
    // Start timer
    const start = process.hrtime();

    // Log on response finish
    res.on('finish', () => {
        const [seconds, nanoseconds] = process.hrtime(start);
        const duration = seconds * 1000 + nanoseconds / 1000000;
        
        // Add response time header
        res.set('X-Response-Time', `${duration}ms`);

        // Log request details
        const logLevel = res.statusCode >= 400 ? 'warn' : 'info';
        herokuLogger[logLevel]('HTTP Request', herokuLogger.requestFormat(req, res));

        // Log slow requests
        if (duration > 1000) {
            herokuLogger.warn('Slow Request', {
                ...herokuLogger.requestFormat(req, res),
                duration: `${duration}ms`
            });
        }
    });

    next();
};

// Export performance monitoring middleware
export const performanceLoggingMiddleware = (req, res, next) => {
    req.startTime = process.hrtime();
    
    res.on('finish', () => {
        const [seconds, nanoseconds] = process.hrtime(req.startTime);
        const duration = seconds * 1000 + nanoseconds / 1000000;

        if (duration > process.env.SLOW_REQUEST_THRESHOLD || 1000) {
            herokuLogger.warn('Performance Alert', herokuLogger.performanceFormat('request', duration, {
                path: req.path,
                method: req.method,
                status: res.statusCode
            }));
        }
    });

    next();
};

// Export security logging middleware
export const securityLoggingMiddleware = (req, res, next) => {
    // Log authentication attempts
    if (req.path.includes('/auth')) {
        herokuLogger.info('Authentication Attempt', herokuLogger.securityFormat('auth_attempt', {
            ip: req.ip,
            path: req.path
        }));
    }

    // Log failed requests
    res.on('finish', () => {
        if (res.statusCode === 401 || res.statusCode === 403) {
            herokuLogger.warn('Security Event', herokuLogger.securityFormat('unauthorized_access', {
                ip: req.ip,
                path: req.path,
                status: res.statusCode
            }));
        }
    });

    next();
};

// Export error logging middleware
export const errorLoggingMiddleware = (err, req, res, next) => {
    herokuLogger.errorWithContext('Request Error', err, {
        path: req.path,
        method: req.method,
        ip: req.ip,
        userId: req.user?.id
    });
    next(err);
};

export default herokuLogger;
