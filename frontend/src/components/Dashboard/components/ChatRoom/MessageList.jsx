/**
 * @fileoverview Message List Component
 * 
 * Renders the list of chat messages with infinite scroll support.
 * Handles loading states and empty message display.
 */

import React from 'react';
import MessageItem from './MessageItem';

const MessageList = ({ messages, userId, loading, page, hasMore, onScroll, typingUsers }) => {
  return (
    <div 
      onScroll={onScroll}
      className="flex-1 bg-gray-700 p-4 overflow-y-auto space-y-4"
      style={{ height: '100%' }}
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
          {messages.map((msg) => (
            <MessageItem 
              key={msg._id} 
              message={msg} 
              isOwnMessage={msg.sender._id === userId} 
            />
          ))}
          {typingUsers.size > 0 && (
            <div className="text-gray-400 text-sm italic">
              Someone is typing...
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MessageList;
