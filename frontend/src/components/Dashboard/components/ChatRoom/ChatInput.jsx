/**
 * @fileoverview Chat Input Component
 * 
 * Handles message input and sending functionality.
 * Includes typing indicator and disabled states.
 */

import React from 'react';

// ChatInput handles user message input and sending
const ChatInput = ({ 
  message,           // Current message text
  onMessageChange,   // Callback for input change
  onSubmit,          // Callback for form submit
  isConnected,       // Connection status
  loading,           // Loading state for sending
  disabled           // Disabled state for input
}) => {
  return (
    // Form container for chat input
    <form onSubmit={onSubmit} className="bg-gray-800 p-4 rounded-b-lg">
      <div className="flex gap-2">
        {/* Text input for message entry */}
        <input
          type="text"
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder={
            disabled ? "Chat room not available" :
            !isConnected ? "Connecting..." :
            loading ? "Loading..." :
            "Type your message..."
          }
          // Disable input if chat is unavailable, not connected, or loading
          disabled={disabled || !isConnected || loading}
          className="flex-1 bg-gray-700 text-white rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-gray-500"
        />
        {/* Send button, disabled if input is empty, not connected, loading, or disabled */}
        <button
          type="submit"
          disabled={!message.trim() || !isConnected || loading || disabled}
          className={`px-4 py-2 rounded transition-colors flex items-center gap-2 ${
            !message.trim() || !isConnected || loading || disabled
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white min-w-[80px] justify-center`}
        >
          {loading ? (
            // Show spinner and 'Sending' text while loading
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Sending</span>
            </>
          ) : (
            // Default button text
            'Send'
          )}
        </button>
      </div>
    </form>
  );
};

export default ChatInput;
