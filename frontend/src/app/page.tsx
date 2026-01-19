'use client';

import { ConversationList } from '@/components/ConversationList';
import { MessageView } from '@/components/MessageView';
import { useConversations } from '@/hooks/useConversations';
import * as Separator from '@radix-ui/react-separator';

export default function Home() {
  const {
    conversations,
    selectedConversation,
    messages,
    hasMoreMessages,
    accountInfo,
    isLoadingConversations,
    isLoadingMessages,
    isLoadingMore,
    error,
    selectConversation,
    loadMoreMessages,
    refreshConversations,
  } = useConversations();

  return (
    <main className="h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center">
            <svg
              className="h-6 w-6 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Instagram Messages
            </h1>
            {accountInfo && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                @{accountInfo.username || accountInfo.name || accountInfo.id}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={refreshConversations}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="Refresh conversations"
        >
          <svg
            className="h-5 w-5 text-gray-600 dark:text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </header>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 p-3">
          <p className="text-sm text-red-600 dark:text-red-400 text-center">
            {error}
          </p>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Conversation list */}
        <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Conversations ({conversations.length})
            </h2>
          </div>
          <div className="flex-1 overflow-hidden">
            <ConversationList
              conversations={conversations}
              selectedId={selectedConversation?.id || null}
              onSelect={selectConversation}
              isLoading={isLoadingConversations}
            />
          </div>
        </div>

        <Separator.Root
          className="bg-gray-200 dark:bg-gray-700 data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px"
          decorative
          orientation="vertical"
        />

        {/* Message view */}
        <div className="flex-1 overflow-hidden">
          <MessageView
            conversation={selectedConversation}
            messages={messages}
            currentUsername={accountInfo?.username || null}
            isLoading={isLoadingMessages}
            isLoadingMore={isLoadingMore}
            hasMoreMessages={hasMoreMessages}
            onLoadMore={loadMoreMessages}
          />
        </div>
      </div>
    </main>
  );
}
