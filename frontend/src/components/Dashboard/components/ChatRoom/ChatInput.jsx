/**
 * @fileoverview Chat Input Component
 * 
 * Handles message input and sending functionality.
 * Includes typing indicator and disabled states.
 */

import React from 'react';

const ChatInput = ({ 
  message, 
  onMessageChange, 
  onSubmit, 
  isConnected, 
  loading, 
  disabled 
}) => {
  return (
    <form onSubmit={onSubmit} className="bg-gray-800 p-4 rounded-b-lg">
      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder={isConnected ? "Type your message..." : "Connecting..."}
          disabled={disabled}
          className="flex-1 bg-gray-700 text-white rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!message.trim() || !isConnected || loading || disabled}
          className={`px-4 py-2 rounded transition-colors ${
            !message.trim() || !isConnected || loading || disabled
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white`}
        >
          Send
        </button>
      </div>
    </form>
  );
};

export default ChatInput;
