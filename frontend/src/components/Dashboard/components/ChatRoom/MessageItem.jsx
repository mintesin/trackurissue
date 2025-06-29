/**
 * @fileoverview Message Item Component
 * 
 * Renders an individual chat message with sender info and timestamp.
 * Handles different styling for user's own messages vs others'.
 */

import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';

// MessageItem renders a single chat message, with sender info, timestamp, and status
const MessageItem = memo(({ message, isOwnMessage }) => {
  // Format the timestamp to HH:mm
  const formatMessageTime = (timestamp) => {
    return format(new Date(timestamp), 'HH:mm');
  };

  return (
    // Align message to right if own, left if from others
    <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} group`}>
      <div className="flex items-baseline space-x-2 mb-1">
        {/* Sender name: 'You' for own messages, otherwise show sender's name */}
        <span className={`font-medium ${
          isOwnMessage ? 'text-blue-400' : 'text-green-400'
        }`}>
          {isOwnMessage ? 'You' : `${message.sender.firstName} ${message.sender.lastName}`}
        </span>
        {/* Timestamp, visible on hover */}
        <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
          {formatMessageTime(message.timestamp)}
        </span>
      </div>
      <div className="flex items-end gap-2">
        {/* Message bubble with different styling for own vs others' messages */}
        <div className={`px-4 py-2 rounded-lg max-w-[80%] ${
          isOwnMessage 
            ? 'bg-blue-600 text-white rounded-br-none' 
            : 'bg-gray-600 text-white rounded-bl-none'
        }`}>
          {message.content}
        </div>
        {/* Show status icon (sent/delivered) for own messages only */}
        {isOwnMessage && (
          <div className="flex items-center text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
            {message.status === 'sent' && (
              // Single checkmark for 'sent'
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {message.status === 'delivered' && (
              // Double checkmark for 'delivered'
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

MessageItem.propTypes = {
  message: PropTypes.shape({
    content: PropTypes.string.isRequired,
    timestamp: PropTypes.string.isRequired,
    status: PropTypes.oneOf(['sent', 'delivered']),
    sender: PropTypes.shape({
      firstName: PropTypes.string.isRequired,
      lastName: PropTypes.string.isRequired
    }).isRequired
  }).isRequired,
  isOwnMessage: PropTypes.bool.isRequired
};

MessageItem.displayName = 'MessageItem';

export default MessageItem;
