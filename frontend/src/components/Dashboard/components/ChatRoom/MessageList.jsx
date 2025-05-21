/**
 * @fileoverview Message List Component
 * 
 * Renders the list of chat messages with infinite scroll support.
 * Handles loading states and empty message display.
 */

import React, { memo, forwardRef } from 'react';
import PropTypes from 'prop-types';
import MessageItem from './MessageItem';

const MessageList = memo(forwardRef(({ 
  messages, 
  userId, 
  loading, 
  page, 
  hasMore, 
  typingUsers,
  className,
  onScroll 
}, ref) => {
  const renderTypingIndicator = () => {
    if (typingUsers.size === 0) return null;
    
    const typingNames = Array.from(typingUsers).map(user => user.firstName).join(', ');
    return (
      <div className="text-gray-400 text-sm italic flex items-center gap-2">
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        {typingNames} {typingUsers.size === 1 ? 'is' : 'are'} typing...
      </div>
    );
  };

  const renderLoadingState = () => (
    <div className="flex items-center justify-center gap-2 text-gray-300">
      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      {page === 1 ? 'Loading messages...' : 'Loading more messages...'}
    </div>
  );

  if (loading && page === 1) {
    return (
      <div ref={ref} className={className} onScroll={onScroll}>
        {renderLoadingState()}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div ref={ref} className={className} onScroll={onScroll}>
        <div className="h-full flex items-center justify-center">
          <div className="text-gray-300 text-center">
            <p className="mb-2">No messages yet</p>
            <p className="text-sm text-gray-400">Start the conversation!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={ref} 
      className={`${className} flex flex-col-reverse`} 
      onScroll={onScroll}
    >
      <div className="flex flex-col-reverse w-full">
        {renderTypingIndicator()}
        {messages.map((msg) => (
          <MessageItem 
            key={msg._id} 
            message={msg} 
            isOwnMessage={msg.sender._id === userId} 
          />
        )).reverse()}
        {loading && page > 1 && renderLoadingState()}
        {hasMore && !loading && (
          <button 
            className="w-full text-center text-sm text-blue-400 hover:text-blue-300 transition-colors"
            onClick={() => window.scrollTo(0, 0)}
          >
            Load more messages
          </button>
        )}
      </div>
    </div>
  );
}));

MessageList.propTypes = {
  messages: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    timestamp: PropTypes.string.isRequired,
    sender: PropTypes.shape({
      _id: PropTypes.string.isRequired,
      firstName: PropTypes.string.isRequired,
      lastName: PropTypes.string.isRequired
    }).isRequired
  })).isRequired,
  userId: PropTypes.string.isRequired,
  loading: PropTypes.bool.isRequired,
  page: PropTypes.number.isRequired,
  hasMore: PropTypes.bool.isRequired,
  typingUsers: PropTypes.instanceOf(Set).isRequired,
  className: PropTypes.string,
  onScroll: PropTypes.func
};

MessageList.displayName = 'MessageList';

export default MessageList;
