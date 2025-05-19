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
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const user = useSelector(state => state.auth.user);

  const { 
    isConnected, 
    error: wsError, 
    participants,
    sendMessage: sendWsMessage, 
    sendTyping, 
    subscribe 
  } = useWebSocket(chatRoomId);

  // Fetch initial messages
  useEffect(() => {
    if (chatRoomId) {
      fetchMessages(1); // Always fetch first page on mount/chatRoomId change
    }
  }, [chatRoomId]); // Remove fetchMessages from deps to avoid infinite loop

  // Watch for participants changes
  useEffect(() => {
    // Only call if both handler and participants exist and participants has changed
    if (onParticipantsChange && participants && participants.length > 0) {
      onParticipantsChange(participants);
    }
  }, [participants, onParticipantsChange]);

  useEffect(() => {
    if (!chatRoomId) return;

    const unsubscribeMessage = subscribe('message', (data) => {
      if (data.roomId === chatRoomId) {
        setMessages(prev => {
          const exists = prev.some(msg => msg._id === data.message._id);
          if (!exists) {
            return [...prev, data.message].sort((a, b) => 
              new Date(a.timestamp) - new Date(b.timestamp)
            );
          }
          return prev;
        });
        chatAPI.markAsRead(chatRoomId).catch(console.error);
      }
    });

    const unsubscribeTyping = subscribe('typing', (data) => {
      if (data.roomId === chatRoomId && data.userId !== user?._id) {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          newSet.add(data.userId);
          return newSet;
        });

        // Clear typing indicator after delay
        const timeoutId = setTimeout(() => {
          setTypingUsers(current => {
            const updated = new Set(current);
            updated.delete(data.userId);
            return updated;
          });
        }, 3000);

        // Cleanup timeout on next typing event or unmount
        return () => clearTimeout(timeoutId);
      }
    });

    return () => {
      unsubscribeMessage();
      unsubscribeTyping();
    };
  }, [chatRoomId, subscribe, user?._id]);

  // Scroll to bottom on new messages, but only if we're near the bottom already
  useEffect(() => {
    // Use RAF to ensure DOM has updated
    requestAnimationFrame(() => {
      if (!chatContainerRef.current || !messagesEndRef.current) return;
      
      const container = chatContainerRef.current;
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      
      if (isNearBottom) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }, [messages]);

  const fetchMessages = useCallback(async (pageNum = 1) => {
    if (!chatRoomId) return;

    try {
      setLoading(true);
      const response = await chatAPI.getChatRoom(chatRoomId, pageNum);
      
      if (pageNum === 1) {
        setMessages(response.data.messages);
      } else {
        setMessages(prev => [...response.data.messages, ...prev]);
      }
      
      setHasMore(response.data.hasMore);
      setPage(pageNum);
      setError(null);
      await chatAPI.markAsRead(chatRoomId);
    } catch (err) {
      console.error('Get messages error:', err);
      setError(err.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [chatRoomId]);

  const handleScroll = useCallback(() => {
    const { scrollTop } = chatContainerRef.current;
    if (scrollTop === 0 && hasMore && !loading) {
      fetchMessages(page + 1);
    }
  }, [hasMore, loading, page, fetchMessages]);

  const handleTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    sendTyping();
    typingTimeoutRef.current = setTimeout(() => {
      typingTimeoutRef.current = null;
    }, 3000);
  }, [sendTyping]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !isConnected || !chatRoomId) return;

    try {
      const messageContent = message.trim();
      setMessage(''); // Clear input immediately for better UX
      
      // Create temporary message for immediate display
      const tempMessage = {
        _id: `temp-${Date.now()}`,
        content: messageContent,
        sender: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName
        },
        timestamp: new Date().toISOString()
      };
      
      // Add temporary message
      setMessages(prev => [...prev, tempMessage]);
      
      // Send via WebSocket for real-time update
      const sent = sendWsMessage(messageContent);
      if (!sent) {
        throw new Error('Failed to send message');
      }
      
      // Also send via REST API for persistence
      await chatAPI.sendMessage(chatRoomId, messageContent);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to send message');
      // Remove the temporary message if sending failed
      setMessages(prev => prev.filter(msg => !msg._id.startsWith('temp-')));
    }
  };

  if (isLoading) {
    return null; // Loading handled by parent
  }

  if (!chatRoomId) {
    return (
      <div className="h-[400px] flex items-center justify-center bg-gray-700 rounded-lg">
        <p className="text-gray-400">Initializing chat room...</p>
      </div>
    );
  }

  if (error || wsError) {
    return <ChatError error={error || wsError} />;
  }

  return (
    <div className="h-[400px] flex flex-col">
      <ChatHeader participants={participants} isConnected={isConnected} />
      <MessageList 
        messages={messages} 
        userId={user?._id} 
        loading={loading} 
        page={page} 
        hasMore={hasMore} 
        onScroll={handleScroll} 
        typingUsers={typingUsers}
        ref={chatContainerRef}
      />
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
      <div ref={messagesEndRef} />
    </div>
  );
};

export default TeamChatRoom;
