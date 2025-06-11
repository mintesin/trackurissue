/**
 * @fileoverview Team Chat Room Component
 * 
 * A real-time chat interface for team communication. This component provides
 * a full-featured chat experience with WebSocket integration for instant messaging.
 * 
 * Features:
 * - Real-time message updates using WebSocket
 * - Message history with infinite scroll
 * - Typing indicators
 * - Online participant tracking
 * - Message read status
 * - Optimistic message updates
 * - Error handling and retry mechanisms
 * - Loading states and skeleton screens
 * 
 * Props:
 * - teamId: String - The ID of the team
 * - chatRoomId: String - The ID of the chat room
 * - isLoading: Boolean - Loading state indicator
 * - onParticipantsChange: Function - Callback for participant count updates
 * 
 * Technical Details:
 * - Uses custom WebSocket hook for real-time communication
 * - Implements infinite scroll for message history
 * - Handles message persistence through REST API
 * - Manages complex UI states and error scenarios
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { chatAPI } from '../../../services/api';
import useWebSocket from '../../../hooks/useWebSocket';
import ChatHeader from './ChatRoom/ChatHeader';
import MessageList from './ChatRoom/MessageList';
import ChatInput from './ChatRoom/ChatInput';
import ChatError from './ChatRoom/ChatError';

const TeamChatRoom = ({ teamId, chatRoomId, isLoading, onParticipantsChange }) => {
  // State for chat messages
  const [messages, setMessages] = useState([]);
  // State for current input message
  const [message, setMessage] = useState('');
  // Loading state for fetching messages
  const [loading, setLoading] = useState(true);
  // Error state for API/WebSocket errors
  const [error, setError] = useState(null);
  // Current page for infinite scroll
  const [page, setPage] = useState(1);
  // Whether there are more messages to load
  const [hasMore, setHasMore] = useState(true);
  // Set of user IDs currently typing
  const [typingUsers, setTypingUsers] = useState(new Set());
  // Ref to scroll to the end of messages
  const messagesEndRef = useRef(null);
  // Ref to the chat container (for scrolling)
  const chatContainerRef = useRef(null);
  // Ref for typing debounce timeout
  const typingTimeoutRef = useRef(null);
  // Current user from Redux store
  const user = useSelector(state => state.auth.user);

  // WebSocket hook for real-time events
  const { 
    isConnected, 
    error: wsError, 
    participants,
    sendMessage: sendWsMessage, 
    sendTyping, 
    subscribe 
  } = useWebSocket(chatRoomId);

  // Fetch initial messages when chatRoomId changes
  useEffect(() => {
    if (chatRoomId) {
      fetchMessages(1); // Always fetch first page on mount/chatRoomId change
    }
  }, [chatRoomId]); // Remove fetchMessages from deps to avoid infinite loop

  // Notify parent of participant changes
  useEffect(() => {
    // Only call if both handler and participants exist and participants has changed
    if (onParticipantsChange && participants && participants.length > 0) {
      onParticipantsChange(participants);
    }
  }, [participants, onParticipantsChange]);

  // Subscribe to WebSocket events for messages and typing
  useEffect(() => {
    if (!chatRoomId) return;

    // Subscribe to new message events
    const unsubscribeMessage = subscribe('message', (data) => {
      if (data.roomId === chatRoomId) {
        setMessages(prev => {
          // Validate message format
          if (!data.message || !data.message._id || !data.message.content || !data.message.sender) {
            return prev;
          }
          // Only add if not already present
          const exists = prev.some(msg => msg._id === data.message._id);
          if (!exists) {
            // Sort messages by timestamp
            return [...prev, data.message].sort((a, b) => 
              new Date(a.timestamp) - new Date(b.timestamp)
            );
          }
          return prev;
        });
        // Mark messages as read
        chatAPI.markAsRead(chatRoomId).catch(console.error);
      }
    });

    // Subscribe to typing indicator events
    const unsubscribeTyping = subscribe('typing', (data) => {
      if (data.roomId === chatRoomId && data.user && data.user._id !== user?._id) {
        setTypingUsers(prev => {
          // Remove any existing user with the same _id, then add the new user object
          const newSet = new Set([...prev].filter(u => u._id !== data.user._id));
          newSet.add(data.user);
          return newSet;
        });

        // Remove typing indicator after 3 seconds
        const timeoutId = setTimeout(() => {
          setTypingUsers(current => {
            const updated = new Set([...current].filter(u => u._id !== data.user._id));
            return updated;
          });
        }, 3000);

        // Cleanup timeout on next typing event or unmount
        return () => clearTimeout(timeoutId);
      }
    });

    // Cleanup function for both subscriptions
    return () => {
      unsubscribeMessage();
      unsubscribeTyping();
    };
  }, [chatRoomId, subscribe, user?._id]);

  // Scroll to the bottom of the chat
  const scrollToBottom = useCallback((smooth = true) => {
    requestAnimationFrame(() => {
      if (!chatContainerRef.current || !messagesEndRef.current) return;
      messagesEndRef.current.scrollIntoView({ 
        behavior: smooth ? 'smooth' : 'auto',
        block: 'end'
      });
    });
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  // Initial scroll to bottom on mount
  useEffect(() => {
    scrollToBottom(false);
  }, []); // Only run once on mount

  // Fetch messages from API (paginated)
  const fetchMessages = useCallback(async (pageNum = 1) => {
    if (!chatRoomId) return;
    try {
      setLoading(true);
      const response = await chatAPI.getChatRoom(chatRoomId, pageNum);
      const newMessages = response.data.messages;
      setMessages(prev => 
        pageNum === 1 ? newMessages : [...prev, ...newMessages]
      );
      setHasMore(response.data.hasMore);
      setPage(pageNum);
      setError(null);
      await chatAPI.markAsRead(chatRoomId);
    } catch (err) {
      setError(err.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [chatRoomId]);

  // Ref for scroll debounce timeout
  const scrollTimeoutRef = useRef(null);

  // Handle infinite scroll to load older messages
  const handleScroll = useCallback((e) => {
    const container = e.target;
    // Add a small threshold to trigger loading before reaching absolute top
    if (container.scrollTop <= 50 && hasMore && !loading) {
      // Debounce scroll events
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        fetchMessages(page + 1);
      }, 100);
    }
  }, [hasMore, loading, page, fetchMessages]);

  // Cleanup scroll timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Handle typing indicator (debounced)
  const handleTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    sendTyping();
    typingTimeoutRef.current = setTimeout(() => {
      typingTimeoutRef.current = null;
    }, 3000);
  }, [sendTyping]);

  // Handle sending a new message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !isConnected || !chatRoomId) return;
    try {
      const messageContent = message.trim();
      setMessage(''); // Clear input immediately for better UX
      // Send via WebSocket only - server will handle broadcasting and persistence
      const sent = sendWsMessage(messageContent);
      if (!sent) {
        throw new Error('Failed to send message');
      }
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to send message');
    }
  };

  // Show nothing if parent is loading
  if (isLoading) {
    return null; // Loading handled by parent
  }

  // Show initializing state if no chatRoomId
  if (!chatRoomId) {
    return (
      <div className="h-[400px] flex items-center justify-center bg-gray-700 rounded-lg">
        <p className="text-gray-400">Initializing chat room...</p>
      </div>
    );
  }

  // Retry handler for error state
  const handleRetry = useCallback(() => {
    setError(null);
    fetchMessages(1);
  }, [fetchMessages]);

  // Show error UI if error exists
  if (error || wsError) {
    return <ChatError 
      error={error || wsError} 
      onRetry={handleRetry}
    />;
  }

  // Main chat UI
  return (
    <div className="h-[400px] flex flex-col">
      {/* Chat header with participants and connection status */}
      <ChatHeader participants={participants} isConnected={isConnected} />
      {/* Message list with infinite scroll and typing indicators */}
      <MessageList 
        messages={messages} 
        userId={user?._id} 
        loading={loading} 
        page={page} 
        hasMore={hasMore}
        typingUsers={typingUsers}
        ref={chatContainerRef}
        className="flex-1 bg-gray-700 p-4 overflow-y-auto"
        onScroll={handleScroll}
      />
      {/* Input for sending new messages */}
      <ChatInput 
        message={message} 
        onMessageChange={(value) => {
          setMessage(value);
          handleTyping();
        }}
        onSubmit={handleSendMessage} 
        isConnected={isConnected} 
        loading={loading} 
        disabled={!chatRoomId} 
      />
      {/* Dummy div for scroll-to-bottom */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default TeamChatRoom;
