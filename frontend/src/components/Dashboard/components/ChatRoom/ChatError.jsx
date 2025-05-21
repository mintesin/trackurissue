/**
 * @fileoverview Chat Error Component
 * 
 * Displays error states in the chat interface.
 * Provides a consistent error display with retry option.
 */

import React from 'react';

const ChatError = ({ error, onRetry }) => (
  <div className="h-[400px] flex flex-col items-center justify-center gap-4 bg-gray-700 rounded-lg p-6">
    <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
      <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <div className="text-center">
      <h3 className="text-lg font-semibold text-red-500 mb-2">Connection Error</h3>
      <p className="text-gray-400 mb-4">{error}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
      >
        Try Again
      </button>
    </div>
  </div>
);

export default ChatError;
