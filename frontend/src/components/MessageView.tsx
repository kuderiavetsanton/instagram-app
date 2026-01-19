'use client';

import { Message, Conversation } from '@/types/instagram';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import * as Avatar from '@radix-ui/react-avatar';
import { useRef, useCallback } from 'react';

interface MessageViewProps {
  conversation: Conversation | null;
  messages: Message[];
  currentUsername: string | null;
  isLoading?: boolean;
  isLoadingMore?: boolean;
  hasMoreMessages?: boolean;
  onLoadMore?: () => void;
}

export function MessageView({
  conversation,
  messages,
  currentUsername,
  isLoading,
  isLoadingMore,
  hasMoreMessages = true,
  onLoadMore,
}: MessageViewProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Infinite scroll - detect when scrolled to top (which is bottom in column-reverse)
  // In column-reverse: scrollTop=0 means at bottom (newest), scrolling "up" increases scrollTop
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container || isLoadingMore || !hasMoreMessages) return;

    // In column-reverse, scrollTop increases as you scroll towards older messages
    // maxScrollTop = scrollHeight - clientHeight
    const distanceFromTop = container.scrollHeight - (container.clientHeight - container.scrollTop);

    // If near the "top" (older messages), load more
    if (distanceFromTop < 100) {
      onLoadMore?.();
    }
  }, [isLoadingMore, hasMoreMessages, onLoadMore]);

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <p className="mt-2">Select a conversation to view messages</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    );
  }

  // Use otherParticipant for header
  const other = conversation.otherParticipant || conversation.participants[0];
  const displayName = other?.username || other?.name || 'Unknown';
  const profilePicture = other?.profile_picture_url;

  // Messages come from API newest first - we use column-reverse CSS so no need to reverse array
  // This way the browser automatically maintains scroll position when new items are added

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3 flex-shrink-0">
        <Avatar.Root className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden">
          {profilePicture && (
            <Avatar.Image
              src={profilePicture}
              alt={displayName}
              className="h-full w-full object-cover"
            />
          )}
          <Avatar.Fallback className="text-white font-semibold">
            {displayName.charAt(0).toUpperCase()}
          </Avatar.Fallback>
        </Avatar.Root>
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">@{displayName}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Instagram Direct</p>
        </div>
      </div>

      {/* Messages with infinite scroll - using flex-direction: column-reverse for automatic scroll preservation */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 flex flex-col-reverse"
      >
        {/* This wrapper is needed because column-reverse reverses the visual order */}
        <div className="flex flex-col gap-3">
          {messages.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              No messages in this conversation
            </p>
          ) : (
            // Messages are newest-first from API, map in reverse to show oldest at top
            [...messages].reverse().map((message) => {
              // Own messages on the RIGHT (blue), other person's on the LEFT (gray)
              const isOwnMessage = message.from.username === currentUsername;

              return (
                <div
                  key={message.id}
                  className={cn(
                    'flex',
                    isOwnMessage ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[70%] rounded-2xl px-4 py-2',
                      isOwnMessage
                        ? 'rounded-br-md'
                        : 'rounded-bl-md'
                    )}
                    style={{
                      backgroundColor: isOwnMessage ? '#3797F0' : 'rgb(243, 245, 247)',
                      color: isOwnMessage ? 'white' : 'black',
                    }}
                  >
                    {/* Text message */}
                    {message.message && (
                      <p className="break-words whitespace-pre-wrap">
                        {message.message}
                      </p>
                    )}

                    {/* Attachments */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="space-y-2">
                        {message.attachments.map((attachment) => (
                          <div key={attachment.id}>
                            {attachment.type === 'image' && attachment.url && (
                              <img
                                src={attachment.url}
                                alt={attachment.name || 'Image'}
                                className="max-w-full rounded-lg"
                                style={{ maxHeight: '300px' }}
                              />
                            )}
                            {attachment.type === 'video' && attachment.url && (
                              <video
                                src={attachment.url}
                                controls
                                className="max-w-full rounded-lg"
                                style={{ maxHeight: '300px' }}
                                poster={attachment.previewUrl}
                              />
                            )}
                            {attachment.type === 'file' && attachment.url && (
                              <a
                                href={attachment.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn(
                                  'flex items-center gap-2 p-2 rounded-lg',
                                  isOwnMessage ? 'bg-blue-600' : 'bg-gray-200'
                                )}
                              >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span className="text-sm">{attachment.name || 'File'}</span>
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Shares (links) */}
                    {message.shares && message.shares.length > 0 && (
                      <div className="space-y-2 mt-2">
                        {message.shares.map((share, index) => (
                          <a
                            key={index}
                            href={share.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                              'block p-2 rounded-lg border',
                              isOwnMessage
                                ? 'border-blue-400 bg-blue-600 hover:bg-blue-700'
                                : 'border-gray-300 bg-white hover:bg-gray-50'
                            )}
                          >
                            {share.name && (
                              <p className={cn(
                                'font-medium text-sm',
                                isOwnMessage ? 'text-white' : 'text-gray-900'
                              )}>
                                {share.name}
                              </p>
                            )}
                            {share.description && (
                              <p className={cn(
                                'text-xs mt-1',
                                isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                              )}>
                                {share.description}
                              </p>
                            )}
                            {share.link && (
                              <p className={cn(
                                'text-xs mt-1 truncate',
                                isOwnMessage ? 'text-blue-200' : 'text-blue-500'
                              )}>
                                {share.link}
                              </p>
                            )}
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Show placeholder if no content */}
                    {!message.message && (!message.attachments || message.attachments.length === 0) && (!message.shares || message.shares.length === 0) && (
                      <p className="break-words whitespace-pre-wrap italic opacity-70">
                        [Unsupported content]
                      </p>
                    )}

                    <p
                      className="text-xs mt-1"
                      style={{
                        color: isOwnMessage ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.5)',
                      }}
                    >
                      {format(new Date(message.createdTime), 'MMM d, h:mm a')}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Load more section - appears at top visually due to column-reverse */}
        <div className="flex flex-col items-center pt-4">
          {/* Loading indicator */}
          {isLoadingMore && (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600" />
            </div>
          )}

          {/* No more messages indicator */}
          {!hasMoreMessages && messages.length > 0 && !isLoadingMore && (
            <div className="text-center py-4 text-gray-400 dark:text-gray-500 text-sm">
              No more messages
            </div>
          )}

          {/* Load more button (fallback) */}
          {hasMoreMessages && !isLoadingMore && messages.length > 0 && (
            <button
              onClick={onLoadMore}
              className="py-2 text-sm text-purple-600 dark:text-purple-400 hover:underline"
            >
              Load older messages
            </button>
          )}
        </div>
      </div>

      {/* 24-hour window notice */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-yellow-50 dark:bg-yellow-900/20 flex-shrink-0">
        <p className="text-sm text-yellow-800 dark:text-yellow-200 text-center">
          Messages can only be sent within 24 hours of user&apos;s last message
        </p>
      </div>
    </div>
  );
}
