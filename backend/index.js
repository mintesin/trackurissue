/**
 * Main Application Entry Point
 * Security improvements implemented:
 * 1. Helmet for security headers
 * 2. Rate limiting
 * 3. CORS configuration
 * 4. Body parser limits
 * 5. Environment variables
 * 6. Database connection security
 * 7. Global error handling
 */

import express from 'express';
import adminRoute from './routes/adminRoutes.js';
import employeeRoute from './routes/employeeRouters.js';
import chatRoomRoutes from './routes/chatRoomRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import sprintRoutes from './routes/sprintRoutes.js';
import milestoneRoutes from './routes/milestoneRoutes.js';
import authRoutes from './routes/authRoutes.js';
import monitoringRoutes from './routes/monitoringRoutes.js';
import connectDb from './config/dbConnect.js';
import redisClient from './config/redis.js';
import { createServer, startServer, setupServerErrorHandlers } from './config/server.js';
import cors from 'cors';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import dotenv from 'dotenv';
import errorHandler from './middleware/errorhandler.js';
import { apiLimiter } from './middleware/authMiddleware.js';
import { initializeModels } from './models/index.js';
import notificationRoutes from './routes/notificationRoutes.js';
import loggingService from './services/loggingService.js';
import monitoringService from './services/monitoringService.js';

// Load environment variables
dotenv.config();

const app = express();

// Trust first proxy for Heroku
app.set('trust proxy', 1);

// Security Middleware with Heroku-specific settings
app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? {
        directives: {
            defaultSrc: ["'self'"],
            connectSrc: ["'self'", process.env.FRONTEND_URL || "https://*.herokuapp.com"],
            imgSrc: ["'self'", "data:", "blob:"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"]
        }
    } : false
}));

// Configure CORS for Heroku
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? [process.env.FRONTEND_URL, /\.herokuapp\.com$/]
        : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser with size limits
app.use(bodyParser.json({ limit: '10kb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10kb' }));

// Apply logging middleware
app.use(loggingService.createRequestLogger());

// Apply monitoring middleware
app.use(monitoringService.createMonitoringMiddleware());

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);

// Routes with /api prefix
app.use('/api/admin', adminRoute);
app.use('/api/employee', employeeRoute);
app.use('/api/chat', chatRoomRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/sprints', sprintRoutes);
app.use('/api/milestones', milestoneRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/monitoring', monitoringRoutes);

// Error logging middleware
app.use(loggingService.createErrorLogger());

// Global error handling
app.use(errorHandler);

// Handle unhandled routes
app.all('*', (req, res, next) => {
    res.status(404).json({
        status: 'error',
        message: `Can't find ${req.originalUrl} on this server!`
    });
});

/**
 * Database connection and server startup
 * Implements secure connection handling and error management
 */
const bootstrap = async () => {
    try {
        // Initialize logging
        loggingService.info('Starting TrackurIssue application...');

        // Connect to Redis using Heroku Redis URL if available
        try {
            const redisUrl = process.env.REDIS_URL || process.env.REDISCLOUD_URL;
            if (redisUrl) {
                await redisClient.connect();
                loggingService.info('Redis connection established successfully');
            } else {
                loggingService.warn('No Redis URL provided, running without cache');
            }
        } catch (redisError) {
            loggingService.warn('Redis connection failed, continuing without cache', { error: redisError.message });
        }

        // Connect to MongoDB with secure options
        const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1/newDb";
        const db = await connectDb(uri);
        app.locals.db = db;
        loggingService.info("Database connection established successfully");

        // Initialize models after DB connection
        initializeModels();
        loggingService.info("Models initialized successfully");

        // Create and start server with Heroku port
        const PORT = process.env.PORT || 3001;
        const server = createServer(app);
        await startServer(server, PORT);
        loggingService.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);

        // Setup error handlers
        setupServerErrorHandlers(server);

        // Log successful startup
        loggingService.info('TrackurIssue application started successfully', {
            port: PORT,
            environment: process.env.NODE_ENV || 'development',
            nodeVersion: process.version
        });

        // Setup graceful shutdown
        setupGracefulShutdown(server);

    } catch (err) {
        loggingService.error("Failed to start server", err);
        if (process.env.NODE_ENV !== 'test') {
            process.exit(1);
        }
    }
};

// Graceful shutdown handler
const setupGracefulShutdown = (server) => {
    const gracefulShutdown = async (signal) => {
        loggingService.info(`Received ${signal}, starting graceful shutdown...`);
        
        try {
            // Stop accepting new connections
            server.close(async () => {
                loggingService.info('HTTP server closed');
                
                // Close database connection
                if (app.locals.db) {
                    await app.locals.db.close();
                    loggingService.info('Database connection closed');
                }
                
                // Close Redis connection
                try {
                    await redisClient.disconnect();
                    loggingService.info('Redis connection closed');
                } catch (redisError) {
                    loggingService.warn('Redis disconnect error', { error: redisError.message });
                }
                
                loggingService.info('Graceful shutdown completed');
                process.exit(0);
            });
            
            // Force close after 30 seconds
            setTimeout(() => {
                loggingService.error('Forced shutdown after timeout');
                process.exit(1);
            }, 30000);
            
        } catch (error) {
            loggingService.error('Error during graceful shutdown', error);
            process.exit(1);
        }
    };

    // Listen for termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
        loggingService.error('Uncaught Exception', error);
        monitoringService.trackError(error, { type: 'uncaughtException' });
        process.exit(1);
    });
    
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
        loggingService.error('Unhandled Rejection', reason, { promise });
        monitoringService.trackError(new Error(reason), { type: 'unhandledRejection' });
    });
};

// Start the server
if (process.env.NODE_ENV !== 'test') {
    bootstrap();
}

export default app;
