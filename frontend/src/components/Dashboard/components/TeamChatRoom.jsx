import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { chatAPI } from '../../../services/api';
import useWebSocket from '../../../hooks/useWebSocket';
import { format } from 'date-fns';
import { TeamChatRoomSkeleton } from './Skeletons';

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
      fetchMessages();
    }
  }, [chatRoomId]);

  // Subscribe to WebSocket messages
  // Watch for participants changes and notify parent
  useEffect(() => {
    if (onParticipantsChange) {
      onParticipantsChange(participants);
    }
  }, [participants, onParticipantsChange]);

  useEffect(() => {
    if (!chatRoomId) return;

    const unsubscribeMessage = subscribe('message', (data) => {
      if (data.roomId === chatRoomId) {
        console.log('Received new message:', data.message);
        // Immediately update messages state with new message
        setMessages(prev => {
          // Check if message already exists to prevent duplicates
          const exists = prev.some(msg => msg._id === data.message._id);
          if (!exists) {
            // Add new message and ensure proper sorting
            const newMessages = [...prev, data.message].sort((a, b) => 
              new Date(a.timestamp) - new Date(b.timestamp)
            );
            
            // Scroll to bottom after state update
            setTimeout(() => {
              if (messagesEndRef.current) {
                messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
              }
            }, 0);
            
            return newMessages;
          }
          return prev;
        });
        // Mark messages as read
        chatAPI.markAsRead(chatRoomId).catch(console.error);
      }
    });

    const unsubscribeTyping = subscribe('typing', (data) => {
      if (data.roomId === chatRoomId && data.userId !== user?._id) {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          newSet.add(data.userId);
          // Remove typing indicator after 3 seconds
          setTimeout(() => {
            setTypingUsers(current => {
              const updated = new Set(current);
              updated.delete(data.userId);
              return updated;
            });
          }, 3000);
          return newSet;
        });
      }
    });

    return () => {
      unsubscribeMessage();
      unsubscribeTyping();
    };
  }, [chatRoomId, subscribe, user?._id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const fetchMessages = async (pageNum = 1) => {
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

      // Mark messages as read after loading
      await chatAPI.markAsRead(chatRoomId);
    } catch (err) {
      console.error('Get messages error:', err);
      setError(err.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = useCallback(() => {
    const { scrollTop } = chatContainerRef.current;
    if (scrollTop === 0 && hasMore && !loading) {
      fetchMessages(page + 1);
    }
  }, [hasMore, loading, page]);

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
      
      // Add temporary message and scroll to bottom
      setMessages(prev => {
        const newMessages = [...prev, tempMessage];
        // Scroll to bottom after state update
        setTimeout(() => {
          if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
          }
        }, 0);
        return newMessages;
      });
      
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
      // Optionally: Remove the temporary message if sending failed
      setMessages(prev => prev.filter(msg => !msg._id.startsWith('temp-')));
    }
  };

  const formatMessageTime = (timestamp) => {
    return format(new Date(timestamp), 'HH:mm');
  };

  if (isLoading) {
    return <TeamChatRoomSkeleton />;
  }

  if (!chatRoomId) {
    return (
      <div className="h-[400px] flex items-center justify-center bg-gray-700 rounded-lg">
        <p className="text-gray-400">Initializing chat room...</p>
      </div>
    );
  }

  if (error || wsError) {
    return (
      <div className="h-[400px] flex items-center justify-center bg-gray-700 rounded-lg">
        <p className="text-red-500">{error || wsError}</p>
      </div>
    );
  }

  return (
    <div className="h-[400px] flex flex-col">
      <div className="bg-gray-800 px-4 py-2 rounded-t-lg flex items-center justify-between">
        <div className="text-white">
          {participants.size} {participants.size === 1 ? 'participant' : 'participants'} online
        </div>
        <div className="text-sm text-gray-400">
          {isConnected ? 'Connected' : 'Connecting...'}
        </div>
      </div>
      <div 
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 bg-gray-700 p-4 overflow-y-auto space-y-4"
      >
        {loading && page === 1 ? (
          <div className="text-gray-300 text-center">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-gray-300 text-center">No messages yet</div>
        ) : (
          <>
            {loading && page > 1 && (
              <div className="text-gray-300 text-center">Loading more messages...</div>
            )}
            {messages.map((msg, index) => (
              <div
                key={msg._id || index}
                className={`flex flex-col ${
                  msg.sender._id === user?._id ? 'items-end' : 'items-start'
                }`}
              >
                <div className="flex items-baseline space-x-2">
                  <span className={`font-medium ${
                    msg.sender._id === user?._id ? 'text-blue-400' : 'text-green-400'
                  }`}>
                    {msg.sender._id === user?._id ? 'You' : `${msg.sender.firstName} ${msg.sender.lastName}`}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatMessageTime(msg.timestamp)}
                  </span>
                </div>
                <div className={`mt-1 px-4 py-2 rounded-lg max-w-[80%] ${
                  msg.sender._id === user?._id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-600 text-white'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {typingUsers.size > 0 && (
              <div className="text-gray-400 text-sm italic">
                Someone is typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      <form onSubmit={handleSendMessage} className="bg-gray-800 p-4 rounded-b-lg">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping();
            }}
            placeholder={isConnected ? "Type your message..." : "Connecting..."}
            disabled={!isConnected || !chatRoomId}
            className="flex-1 bg-gray-700 text-white rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!message.trim() || !isConnected || loading || !chatRoomId}
            className={`px-4 py-2 rounded transition-colors ${
              !message.trim() || !isConnected || loading || !chatRoomId
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white`}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default TeamChatRoom;
