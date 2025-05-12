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
import userRoute from './routes/employeeRouters.js';
import connectDb from './config/dbConnect.js';
import cors from 'cors';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import dotenv from 'dotenv';
import errorHandler from './middleware/errorhandler.js';
import { apiLimiter } from './middleware/authMiddleware.js';

// Load environment variables
dotenv.config();

const app = express();

// Security Middleware
app.use(helmet()); // Set security HTTP headers
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? process.env.FRONTEND_URL 
        : 'http://localhost:3000',
    credentials: true
}));

// Body parser with size limits
app.use(bodyParser.json({ limit: '10kb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10kb' }));

// Apply rate limiting to all routes
app.use('/api', apiLimiter);

// Routes
app.use('/admin', adminRoute);
app.use('/user', userRoute);

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
const startServer = async () => {
    try {
        // Connect to MongoDB with secure options
        const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1/newDb";
        const db = await connectDb(uri);
        app.locals.db = db;
        console.log("Database connection established successfully");

        // Start server
        const PORT = process.env.PORT || 3000;
        const server = app.listen(PORT, () => {
            console.log(`Server is running at http://localhost:${PORT}`);
        });

        // Handle server errors
        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                console.error(`Port ${PORT} is already in use`);
            } else {
                console.error('Server error:', error);
            }
            if (process.env.NODE_ENV !== 'test') {
                process.exit(1);
            }
        });

        // Handle unhandled rejections
        process.on('unhandledRejection', (err) => {
            console.error('UNHANDLED REJECTION! 💥 Shutting down...');
            console.error(err.name, err.message);
            server.close(() => {
                if (process.env.NODE_ENV !== 'test') {
                    process.exit(1);
                }
            });
        });

        // Handle uncaught exceptions
        process.on('uncaughtException', (err) => {
            console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
            console.error(err.name, err.message);
            if (process.env.NODE_ENV !== 'test') {
                process.exit(1);
            }
        });

        // Handle SIGTERM
        process.on('SIGTERM', () => {
            console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
            server.close(() => {
                console.log('💥 Process terminated!');
                if (process.env.NODE_ENV !== 'test') {
                    process.exit(0);
                }
            });
        });

    } catch (err) {
        console.error("Failed to start server:", err);
        if (process.env.NODE_ENV !== 'test') {
            process.exit(1);
        }
    }
};

// Start the server
if (process.env.NODE_ENV !== 'test') {
    startServer();
}

export default app;
