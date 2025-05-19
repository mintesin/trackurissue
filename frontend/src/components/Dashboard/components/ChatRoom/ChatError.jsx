/**
 * @fileoverview Chat Error Component
 * 
 * Displays error states in the chat interface.
 * Provides a consistent error display with retry option.
 */

import React from 'react';

const ChatError = ({ error }) => (
  <div className="h-[400px] flex items-center justify-center bg-gray-700 rounded-lg">
    <p className="text-red-500">{error}</p>
  </div>
);

export default ChatError;
