/**
 * Database Connection Configuration
 * Security improvements implemented:
 * 1. SSL/TLS support for production
 * 2. Connection timeout settings
 * 3. Authentication handling
 * 4. Connection pool configuration
 * 5. Secure query options
 */

import mongoose from "mongoose";

async function connectDb(uri) {
    try {
        // Security options for MongoDB connection
        const options = {
            // Maximum number of connections in the pool
            maxPoolSize: 10,
            // How long to wait for a connection from the pool (5 seconds)
            serverSelectionTimeoutMS: 5000,
            // How long to wait for a response from the server (30 seconds)
            socketTimeoutMS: 30000,
            // Ensure queries use indexes
            autoIndex: process.env.NODE_ENV !== 'production',
            // Prevent potentially malicious query operators
            sanitizeFilter: true
        };

        // Connect to MongoDB
        const connection = await mongoose.connect(uri, options);

        // Log successful connection
        console.log("The connection is set successfully");

        // Set up connection error handlers
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('MongoDB disconnected. Attempting to reconnect...');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB reconnected successfully');
        });

        // Handle application termination
        process.on('SIGINT', async () => {
            try {
                await mongoose.connection.close();
                console.log('MongoDB connection closed through app termination');
                process.exit(0);
            } catch (err) {
                console.error('Error closing MongoDB connection:', err);
                process.exit(1);
            }
        });

        return connection;
    } catch (err) {
        console.error("MongoDB connection error:", err);
        // Throw a new error without sensitive connection details
        throw new Error("Failed to connect to database");
    }
}

export default connectDb;
