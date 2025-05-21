/**
 * @fileoverview Chat Header Component
 * 
 * Displays the chat room header with participant count and connection status.
 */

import React, { memo } from 'react';
import PropTypes from 'prop-types';

const ChatHeader = memo(({ participants, isConnected }) => {
  const participantCount = Array.isArray(participants) ? participants.length : participants.size;
  const connectionStatus = isConnected ? (
    <>
      <div className="w-2 h-2 rounded-full bg-green-500" />
      <span className="text-sm text-gray-300">Connected</span>
    </>
  ) : (
    <>
      <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
      <span className="text-sm text-gray-400">
        Connecting<span className="animate-pulse">...</span>
      </span>
    </>
  );

  return (
    <div className="bg-gray-800 px-4 py-3 rounded-t-lg flex items-center justify-between border-b border-gray-700">
      <div className="flex items-center gap-2">
        <div className="text-white font-medium">Team Chat</div>
        <div className="text-sm text-gray-400">
          ({participantCount} {participantCount === 1 ? 'participant' : 'participants'} online)
        </div>
      </div>
      <div className="flex items-center gap-2">
        {connectionStatus}
      </div>
    </div>
  );
});

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
