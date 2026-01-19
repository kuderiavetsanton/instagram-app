'use client';

import { Conversation } from '@/types/instagram';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import * as Avatar from '@radix-ui/react-avatar';

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (conversation: Conversation) => void;
  isLoading?: boolean;
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  isLoading,
}: ConversationListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No conversations found
      </div>
    );
  }

  return (
    <ScrollArea.Root className="h-full">
      <ScrollArea.Viewport className="h-full w-full">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {conversations.map((conversation) => {
            // Use otherParticipant (the person we're chatting with)
            const other = conversation.otherParticipant || conversation.participants[0];
            const displayName = other?.name || other?.username || 'Unknown';
            const initial = displayName.charAt(0).toUpperCase();
            const profilePicture = other?.profile_picture_url;

            return (
              <button
                key={conversation.id}
                onClick={() => onSelect(conversation)}
                className={cn(
                  'w-full p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left',
                  selectedId === conversation.id && 'bg-purple-50 dark:bg-purple-900/20'
                )}
              >
                <Avatar.Root className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {profilePicture && (
                    <Avatar.Image
                      src={profilePicture}
                      alt={displayName}
                      className="h-full w-full object-cover"
                    />
                  )}
                  <Avatar.Fallback
                    className="text-white font-semibold flex items-center justify-center h-full w-full"
                    delayMs={profilePicture ? 600 : 0}
                  >
                    {initial}
                  </Avatar.Fallback>
                </Avatar.Root>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    @{displayName}
                  </p>
                  {conversation.updatedTime && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDistanceToNow(new Date(conversation.updatedTime), {
                        addSuffix: true,
                      })}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar
        className="flex select-none touch-none p-0.5 bg-gray-100 dark:bg-gray-800 transition-colors duration-150 ease-out hover:bg-gray-200 dark:hover:bg-gray-700 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2.5"
        orientation="vertical"
      >
        <ScrollArea.Thumb className="flex-1 bg-gray-300 dark:bg-gray-600 rounded-full relative" />
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
  );
}
