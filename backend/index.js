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
import connectDb from './config/dbConnect.js';
import { createServer, startServer, setupServerErrorHandlers } from './config/server.js';
import cors from 'cors';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import dotenv from 'dotenv';
import errorHandler from './middleware/errorhandler.js';
import { apiLimiter } from './middleware/authMiddleware.js';
import { initializeModels } from './models/index.js';

// Load environment variables
dotenv.config();

const app = express();

// Security Middleware
app.use(helmet()); // Set security HTTP headers
// Configure CORS
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? process.env.FRONTEND_URL 
        : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser with size limits
app.use(bodyParser.json({ limit: '10kb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10kb' }));

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);

// Routes with /api prefix
app.use('/api/admin', adminRoute);
app.use('/api/employee', employeeRoute);
app.use('/api/chat', chatRoomRoutes);
app.use('/api/team', teamRoutes);

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
        // Connect to MongoDB with secure options
        const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1/newDb";
        const db = await connectDb(uri);
        app.locals.db = db;
        console.log("Database connection established successfully");

        // Initialize models after DB connection
        initializeModels();
        console.log("Models initialized successfully");

        // Create and start server
        const PORT = process.env.PORT || 3000;
        const server = createServer(app);
        await startServer(server, PORT);

        // Setup error handlers
        setupServerErrorHandlers(server);

    } catch (err) {
        console.error("Failed to start server:", err);
        if (process.env.NODE_ENV !== 'test') {
            process.exit(1);
        }
    }
};

// Start the server
if (process.env.NODE_ENV !== 'test') {
    bootstrap();
}

export default app;
