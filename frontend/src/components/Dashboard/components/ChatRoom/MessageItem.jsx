/**
 * @fileoverview Message Item Component
 * 
 * Renders an individual chat message with sender info and timestamp.
 * Handles different styling for user's own messages vs others'.
 */

import React from 'react';
import { format } from 'date-fns';

const MessageItem = ({ message, isOwnMessage }) => {
  const formatMessageTime = (timestamp) => {
    return format(new Date(timestamp), 'HH:mm');
  };

  return (
    <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
      <div className="flex items-baseline space-x-2">
        <span className={`font-medium ${
          isOwnMessage ? 'text-blue-400' : 'text-green-400'
        }`}>
          {isOwnMessage ? 'You' : `${message.sender.firstName} ${message.sender.lastName}`}
        </span>
        <span className="text-xs text-gray-400">
          {formatMessageTime(message.timestamp)}
        </span>
      </div>
      <div className={`mt-1 px-4 py-2 rounded-lg max-w-[80%] ${
        isOwnMessage 
          ? 'bg-blue-600 text-white' 
          : 'bg-gray-600 text-white'
      }`}>
        {message.content}
      </div>
    </div>
  );
};

export default MessageItem;
