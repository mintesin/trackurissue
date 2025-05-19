import http from 'http';
import { initializeWebSocket } from './websocket.js';

export const createServer = (app) => {
    // Create HTTP server
    const server = http.createServer(app);

    // Initialize WebSocket server
    initializeWebSocket(server);

    return server;
};

export const startServer = (server, port) => {
    return new Promise((resolve, reject) => {
        try {
            server.listen(port, () => {
                console.log(`Server is running at http://localhost:${port}`);
                resolve(server);
            });

            // Handle server errors
            server.on('error', (error) => {
                if (error.code === 'EADDRINUSE') {
                    console.error(`Port ${port} is already in use`);
                } else {
                    console.error('Server error:', error);
                }
                reject(error);
            });

        } catch (error) {
            reject(error);
        }
    });
};

export const setupServerErrorHandlers = (server) => {
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
};
