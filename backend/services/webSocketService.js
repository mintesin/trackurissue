import { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';
import * as genericError from './genericError.js';

class WebSocketService {
    constructor() {
        this.clients = new Map(); // Map of userId -> WebSocket
        this.rooms = new Map();   // Map of roomId -> Set of userIds
        this.wss = null;
    }

    initialize(server) {
        try {
            this.wss = new WebSocketServer({ server });
            console.log('WebSocket server created');

            this.wss.on('connection', (ws, req) => {
                console.log('New WebSocket connection attempt');

                // Set initial timeout for authentication
                const authTimeout = setTimeout(() => {
                    if (!ws.userId) {
                        console.log('Client failed to authenticate in time');
                        ws.close(1008, 'Authentication timeout');
                    }
                }, 10000); // 10 seconds timeout

                // Handle authentication and messages
                ws.on('message', (message) => {
                    try {
                        const data = JSON.parse(message);
                        console.log('Received message type:', data.type);
                        
                        switch (data.type) {
                            case 'auth':
                                this.handleAuth(ws, data.token);
                                clearTimeout(authTimeout);
                                break;
                            case 'join':
                                this.handleJoin(ws, data.roomId);
                                break;
                            case 'leave':
                                this.handleLeave(ws, data.roomId);
                                break;
                            case 'message':
                                this.handleMessage(ws, data);
                                break;
                            case 'typing':
                                this.handleTyping(ws, data.roomId);
                                break;
                            default:
                                console.warn('Unknown message type:', data.type);
                                ws.send(JSON.stringify({
                                    type: 'error',
                                    message: 'Unknown message type'
                                }));
                        }
                    } catch (error) {
                        console.error('WebSocket message processing error:', error);
                        ws.send(JSON.stringify({
                            type: 'error',
                            message: 'Failed to process message'
                        }));
                    }
                });

                // Handle client disconnect
                ws.on('close', () => {
                    console.log('Client disconnected:', ws.userId);
                    this.handleDisconnect(ws);
                });

                // Handle errors
                ws.on('error', (error) => {
                    console.error('WebSocket client error:', error);
                    this.handleDisconnect(ws);
                });
            });

            this.wss.on('error', (error) => {
                console.error('WebSocket server error:', error);
            });

        } catch (error) {
            console.error('Failed to initialize WebSocket server:', error);
            throw error;
        }
    }

    handleAuth(ws, token) {
        try {
            if (!token) {
                throw new genericError.UnauthorizedError('No token provided');
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            ws.userId = decoded.id;
            ws.firstName = decoded.firstName;  // Store user details in ws connection
            ws.lastName = decoded.lastName;
            this.clients.set(decoded.id, ws);
            
            console.log('Client authenticated:', decoded.id);
            
            ws.send(JSON.stringify({ 
                type: 'auth', 
                success: true,
                userId: decoded.id,
                firstName: decoded.firstName,
                lastName: decoded.lastName
            }));
        } catch (error) {
            console.error('Authentication error:', error);
            ws.send(JSON.stringify({ 
                type: 'auth', 
                success: false, 
                error: 'Invalid token' 
            }));
            ws.close(1008, 'Authentication failed');
        }
    }

    handleJoin(ws, roomId) {
        if (!ws.userId) {
            console.warn('Unauthenticated client attempted to join room:', roomId);
            return;
        }

        try {
            if (!this.rooms.has(roomId)) {
                this.rooms.set(roomId, new Set());
            }
            
            // Store roomId in WebSocket connection for easy access
            ws.roomId = roomId;
            this.rooms.get(roomId).add(ws.userId);
            console.log(`User ${ws.userId} joined room ${roomId}`);
            
            // Prepare participant list
            const participants = Array.from(this.rooms.get(roomId));
            
            // Send join confirmation to the joining user
            ws.send(JSON.stringify({ 
                type: 'join', 
                roomId, 
                success: true,
                participants
            }));

            // Notify all participants (including sender) about the updated participant list
            this.broadcastToRoom(roomId, {
                type: 'participant_joined',
                roomId,
                userId: ws.userId,
                participants // Include full participant list in the update
            });
        } catch (error) {
            console.error('Error joining room:', error);
            ws.send(JSON.stringify({
                type: 'join',
                success: false,
                error: 'Failed to join room'
            }));
        }
    }

    handleLeave(ws, roomId) {
        if (!ws.userId) return;

        try {
            const room = this.rooms.get(roomId);
            if (room) {
                room.delete(ws.userId);
                console.log(`User ${ws.userId} left room ${roomId}`);
                
                if (room.size === 0) {
                    this.rooms.delete(roomId);
                    console.log(`Room ${roomId} deleted (empty)`);
                } else {
                    // Get updated participant list
                    const participants = Array.from(room);
                    
                    // Notify all remaining participants about the leave and send updated list
                    this.broadcastToRoom(roomId, {
                        type: 'participant_left',
                        roomId,
                        userId: ws.userId,
                        participants // Include full participant list in the update
                    });
                }
            }
        } catch (error) {
            console.error('Error leaving room:', error);
        }
    }

    handleMessage(ws, data) {
        if (!ws.userId || !data.roomId) {
            console.warn('Invalid message attempt:', { userId: ws.userId, roomId: data.roomId });
            return;
        }

        try {
            const room = this.rooms.get(data.roomId);
            if (!room) {
                console.warn(`Room ${data.roomId} not found for message:`, data);
                return;
            }

            // Verify sender is in the room
            if (!room.has(ws.userId)) {
                console.warn(`User ${ws.userId} attempted to send message to room ${data.roomId} but is not a member`);
                return;
            }

            // Create message object with consistent format
            const messageData = {
                _id: new Date().getTime().toString(),
                content: data.message,
                sender: {
                    _id: ws.userId,
                    firstName: ws.firstName || 'User',
                    lastName: ws.lastName || ws.userId.substring(0, 5)
                },
                timestamp: new Date().toISOString()
            };

            const message = {
                type: 'message',
                roomId: data.roomId,
                message: messageData
            };

            // Broadcast message IMMEDIATELY to all clients in the room
            console.log('Broadcasting message:', message);
            this.broadcastToRoom(data.roomId, message);

            // Save the message to the chat room in the database
            import('../models/chatRoomModel.js').then(({ default: ChatRoom }) => {
                ChatRoom.findByIdAndUpdate(
                    data.roomId,
                    {
                        $push: {
                            messages: {
                                content: data.message,
                                sender: ws.userId,
                                timestamp: messageData.timestamp
                            }
                        },
                        $set: { updatedAt: new Date() }
                    },
                    { new: true }
                ).catch(dbError => {
                    console.error('Error saving message to database:', dbError);
                });
            });
        } catch (error) {
            console.error('Error handling message:', error);
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Failed to send message'
            }));
        }
    }

    handleTyping(ws, roomId) {
        if (!ws.userId) return;

        try {
            const room = this.rooms.get(roomId);
            if (room) {
                const typingEvent = {
                    type: 'typing',
                    roomId,
                    user: {
                        _id: ws.userId,
                        firstName: ws.firstName,
                        lastName: ws.lastName
                    }
                };

                this.broadcastToRoom(roomId, typingEvent, [ws.userId]); // Exclude sender
            }
        } catch (error) {
            console.error('Error handling typing event:', error);
        }
    }

    handleDisconnect(ws) {
        if (!ws.userId) return;

        try {
            // Remove client from all rooms
            this.rooms.forEach((users, roomId) => {
                if (users.has(ws.userId)) {
                    users.delete(ws.userId);
                    console.log(`User ${ws.userId} removed from room ${roomId}`);
                    
                    if (users.size === 0) {
                        this.rooms.delete(roomId);
                        console.log(`Room ${roomId} deleted (empty)`);
                    } else {
                        // Get updated participant list
                        const participants = Array.from(users);
                        
                        // Notify remaining participants about the leave and send updated list
                        this.broadcastToRoom(roomId, {
                            type: 'participant_left',
                            roomId,
                            userId: ws.userId,
                            participants
                        });
                    }
                }
            });

            // Remove client from clients map
            this.clients.delete(ws.userId);
            console.log(`User ${ws.userId} disconnected and cleanup completed`);
        } catch (error) {
            console.error('Error handling disconnect:', error);
        }
    }

    broadcastToRoom(roomId, message, excludeUsers = []) {
        try {
            const room = this.rooms.get(roomId);
            if (!room) {
                console.log(`Room ${roomId} not found`);
                return;
            }

            console.log(`Broadcasting to room ${roomId}. Active users:`, Array.from(room));
            
            // Get all connected clients for this room
            const clients = Array.from(room)
                .map(userId => this.clients.get(userId))
                .filter(ws => ws && ws.readyState === 1 && !excludeUsers.includes(ws.userId)); // WebSocket.OPEN is 1

            // Broadcast message to all connected clients
            const messageStr = JSON.stringify(message);
            clients.forEach(ws => {
                try {
                    console.log(`Sending message to user ${ws.userId} in room ${roomId}`);
                    ws.send(messageStr);
                } catch (err) {
                    console.error(`Failed to send message to user ${ws.userId}:`, err);
                }
            });

            console.log(`Message broadcast complete. Sent to ${clients.length} clients.`);
        } catch (error) {
            console.error('Error broadcasting to room:', error);
        }
    }
}

export default new WebSocketService();
