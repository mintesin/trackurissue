/**
 * @fileoverview Chat Header Component
 * 
 * Displays the chat room header with participant count and connection status.
 */

import React from 'react';

const ChatHeader = ({ participants, isConnected }) => (
  <div className="bg-gray-800 px-4 py-2 rounded-t-lg flex items-center justify-between">
    <div className="text-white">
      {participants.size} {participants.size === 1 ? 'participant' : 'participants'} online
    </div>
    <div className="text-sm text-gray-400">
      {isConnected ? 'Connected' : 'Connecting...'}
    </div>
  </div>
);

export default ChatHeader;
