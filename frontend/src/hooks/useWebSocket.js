/**
 * @fileoverview WebSocket Hook
 * 
 * Custom React hook for managing WebSocket connections in chat rooms.
 * Provides real-time communication features including:
 * - Automatic connection management
 * - Authentication handling
 * - Room participation tracking
 * - Message subscription system
 * - Reconnection logic
 * - Typing indicators
 */

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * WebSocket connection manager hook
 * @param {string} roomId - ID of the chat room to connect to
 * @returns {Object} WebSocket connection state and methods
 */
const useWebSocket = (roomId) => {
  /** Connection status state */
  const [isConnected, setIsConnected] = useState(false);
  /** Error state for connection/message handling */
  const [error, setError] = useState(null);
  /** Set of current room participants */
  const [participants, setParticipants] = useState(new Set());
  
  /** Reference to WebSocket instance */
  const wsRef = useRef(null);
  /** Map of message type subscribers */
  const subscribersRef = useRef(new Map());
  /** Reference to reconnection timeout */
  const reconnectTimeoutRef = useRef(null);
  /** Maximum number of reconnection attempts */
  const maxReconnectAttempts = 5;
  /** Current reconnection attempt counter */
  const reconnectAttemptRef = useRef(0);

  /**
   * Initialize and manage WebSocket connection
   * Sets up connection, message handling, and cleanup
   */
  useEffect(() => {
    if (!roomId) return;

    const connectWebSocket = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found');
        return;
      }

      try {
        // Use the same host as the API but with ws:// protocol
        // Use wss:// for HTTPS, ws:// for HTTP
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.hostname}:3000/ws`;
        console.log('Connecting to WebSocket:', wsUrl);
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('WebSocket connected');
          reconnectAttemptRef.current = 0; // Reset reconnect attempts on successful connection
          
          // Authenticate the connection
          ws.send(JSON.stringify({
            type: 'auth',
            token
          }));
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('WebSocket message received:', data);

            switch (data.type) {
              case 'auth':
                if (data.success) {
                  setIsConnected(true);
                  setError(null);
                  // Join the chat room after successful authentication
                  ws.send(JSON.stringify({
                    type: 'join',
                    roomId
                  }));
                } else {
                  setError(data.error || 'Authentication failed');
                  ws.close();
                }
                break;

              case 'join':
                if (data.success) {
                  console.log(`Joined room ${roomId}`);
                  if (data.participants) {
                    setParticipants(new Set(data.participants));
                  }
                } else {
                  setError(data.error || 'Failed to join room');
                }
                break;

              case 'participant_joined':
                if (data.participants) {
                  setParticipants(new Set(data.participants));
                }
                break;

              case 'participant_left':
                if (data.participants) {
                  setParticipants(new Set(data.participants));
                }
                break;

              case 'error':
                console.error('WebSocket error message:', data.message);
                setError(data.message);
                break;

            default:
                // Handle other message types using subscribers
                const subscribers = subscribersRef.current.get(data.type) || [];
                console.log(`Found ${subscribers.length} subscribers for message type ${data.type}`);
                console.log('Message data:', data);
                
                if (subscribers.length > 0) {
                    subscribers.forEach(callback => {
                        try {
                            console.log('Calling subscriber callback with data:', data);
                            callback(data);
                        } catch (err) {
                            console.error('Error in subscriber callback:', err);
                        }
                    });
                } else {
                    console.warn(`No subscribers found for message type: ${data.type}`);
                }
            }
          } catch (err) {
            console.error('Error processing WebSocket message:', err);
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setError('WebSocket connection error');
        };

        ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          setIsConnected(false);

          // Attempt to reconnect unless explicitly closed
          if (event.code !== 1000 && reconnectAttemptRef.current < maxReconnectAttempts) {
            const timeout = Math.min(1000 * Math.pow(2, reconnectAttemptRef.current), 10000);
            console.log(`Attempting to reconnect in ${timeout}ms...`);
            
            reconnectTimeoutRef.current = setTimeout(() => {
              reconnectAttemptRef.current += 1;
              connectWebSocket();
            }, timeout);
          }
        };

      } catch (err) {
        console.error('Error creating WebSocket connection:', err);
        setError('Failed to create WebSocket connection');
      }
    };

    connectWebSocket();

    // Cleanup on unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        // Leave the room before closing
        wsRef.current.send(JSON.stringify({
          type: 'leave',
          roomId
        }));
        wsRef.current.close(1000, 'Component unmounted');
      }
    };
  }, [roomId]);

  /**
   * Subscribe to specific message types
   * @param {string} type - Message type to subscribe to
   * @param {Function} callback - Callback function for handling messages
   * @returns {Function} Unsubscribe function
   */
  const subscribe = useCallback((type, callback) => {
    if (!subscribersRef.current.has(type)) {
      subscribersRef.current.set(type, []);
    }
    subscribersRef.current.get(type).push(callback);

    // Return unsubscribe function
    return () => {
      const subscribers = subscribersRef.current.get(type);
      const index = subscribers.indexOf(callback);
      if (index > -1) {
        subscribers.splice(index, 1);
      }
    };
  }, []);

  /**
   * Send a message to the chat room
   * @param {string} content - Message content to send
   * @returns {boolean} Success status of sending message
   */
  const sendMessage = useCallback((content) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket is not connected');
      return false;
    }

    try {
      wsRef.current.send(JSON.stringify({
        type: 'message',
        roomId,
        message: content
      }));
      return true;
    } catch (err) {
      console.error('Error sending message:', err);
      return false;
    }
  }, [roomId]);

  /**
   * Send typing indicator to the chat room
   * @returns {boolean} Success status of sending indicator
   */
  const sendTyping = useCallback(() => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return false;
    }

    try {
      wsRef.current.send(JSON.stringify({
        type: 'typing',
        roomId
      }));
      return true;
    } catch (err) {
      console.error('Error sending typing indicator:', err);
      return false;
    }
  }, [roomId]);

  return {
    isConnected,
    error,
    participants,
    sendMessage,
    sendTyping,
    subscribe
  };
};

export default useWebSocket;
