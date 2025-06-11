/**
 * @fileoverview Chat Header Component
 * 
 * Displays the chat room header with participant count and connection status.
 */

import React, { memo } from 'react';
import PropTypes from 'prop-types';

// ChatHeader displays the chat room's header, including participant count and connection status
const ChatHeader = memo(({ participants, isConnected }) => {
  // Determine the number of participants (supports both Array and Set)
  const participantCount = Array.isArray(participants) ? participants.length : participants.size;

  // Render connection status: green for connected, yellow/pulsing for connecting
  const connectionStatus = isConnected ? (
    <>
      {/* Green dot and 'Connected' label when online */}
      <div className="w-2 h-2 rounded-full bg-green-500" />
      <span className="text-sm text-gray-300">Connected</span>
    </>
  ) : (
    <>
      {/* Yellow pulsing dot and 'Connecting...' label when not connected */}
      <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
      <span className="text-sm text-gray-400">
        Connecting<span className="animate-pulse">...</span>
      </span>
    </>
  );

  return (
    // Header container with styling for background, padding, and layout
    <div className="bg-gray-800 px-4 py-3 rounded-t-lg flex items-center justify-between border-b border-gray-700">
      <div className="flex items-center gap-2">
        {/* Chat room title */}
        <div className="text-white font-medium">Team Chat</div>
        {/* Display participant count with correct pluralization */}
        <div className="text-sm text-gray-400">
          ({participantCount} {participantCount === 1 ? 'participant' : 'participants'} online)
        </div>
      </div>
      <div className="flex items-center gap-2">
        {/* Show connection status indicator */}
        {connectionStatus}
      </div>
    </div>
  );
});

// PropTypes for type checking of props
ChatHeader.propTypes = {
  participants: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.shape({
      _id: PropTypes.string.isRequired,
      firstName: PropTypes.string.isRequired,
      lastName: PropTypes.string.isRequired
    })),
    PropTypes.instanceOf(Set)
  ]).isRequired,
  isConnected: PropTypes.bool.isRequired
};

ChatHeader.displayName = 'ChatHeader';

export default ChatHeader;
