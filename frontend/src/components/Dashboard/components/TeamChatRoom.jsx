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

    console.log('Setting up message subscription for room:', chatRoomId);

    const unsubscribeMessage = subscribe('message', (data) => {
      console.log('Message received in TeamChatRoom:', data);
      console.log('Current chatRoomId:', chatRoomId);
      console.log('Message roomId:', data.roomId);
      
      if (data.roomId === chatRoomId) {
        console.log('Message is for current room');
        setMessages(prev => {
          console.log('Previous messages:', prev);
          console.log('New message to add:', data.message);
          
          // Ensure we have all required fields
          if (!data.message || !data.message._id || !data.message.content || !data.message.sender) {
            console.error('Invalid message format:', data.message);
            return prev;
          }

          const exists = prev.some(msg => msg._id === data.message._id);
          if (!exists) {
            const newMessages = [...prev, data.message].sort((a, b) => 
              new Date(a.timestamp) - new Date(b.timestamp)
            );
            console.log('Updated messages array:', newMessages);
            return newMessages;
          }
          console.log('Message already exists, not adding');
          return prev;
        });
        chatAPI.markAsRead(chatRoomId).catch(console.error);
      } else {
        console.log('Message is for different room, ignoring');
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

    // Cleanup function for both subscriptions
    return () => {
      console.log('Cleaning up subscriptions for room:', chatRoomId);
      unsubscribeMessage();
      unsubscribeTyping();
    };
  }, [chatRoomId, subscribe, user?._id]);

  const scrollToBottom = useCallback((smooth = true) => {
    requestAnimationFrame(() => {
      if (!chatContainerRef.current || !messagesEndRef.current) return;
      messagesEndRef.current.scrollIntoView({ 
        behavior: smooth ? 'smooth' : 'auto',
        block: 'end'
      });
    });
  }, []);

  // Always scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  // Initial scroll to bottom
  useEffect(() => {
    scrollToBottom(false);
  }, []); // Only run once on mount

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
      console.error('Get messages error:', err);
      setError(err.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [chatRoomId]);

  const scrollTimeoutRef = useRef(null);

  const handleScroll = useCallback((e) => {
    const container = e.target;
    // Add a small threshold to trigger loading before reaching absolute top
    if (container.scrollTop <= 50 && hasMore && !loading) {
      // Debounce scroll events
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        console.log('Near top, loading more messages...');
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
      
      // Send via WebSocket only - server will handle broadcasting and persistence
      const sent = sendWsMessage(messageContent);
      if (!sent) {
        throw new Error('Failed to send message');
      }
      
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to send message');
      // No need to handle temporary message removal since we're not using optimistic updates
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

  const handleRetry = useCallback(() => {
    setError(null);
    fetchMessages(1);
  }, [fetchMessages]);

  if (error || wsError) {
    return <ChatError 
      error={error || wsError} 
      onRetry={handleRetry}
    />;
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
        typingUsers={typingUsers}
        ref={chatContainerRef}
        className="flex-1 bg-gray-700 p-4 overflow-y-auto"
        onScroll={handleScroll}
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
