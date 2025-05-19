import webSocketService from '../services/webSocketService.js';

export const initializeWebSocket = (server) => {
    try {
        webSocketService.initialize(server);
        console.log('WebSocket server initialized successfully');
    } catch (error) {
        console.error('Failed to initialize WebSocket server:', error);
        throw error;
    }
};
