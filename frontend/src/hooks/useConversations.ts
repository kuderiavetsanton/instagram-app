'use client';

import { useState, useEffect, useCallback } from 'react';
import { Conversation, Message, AccountInfo, Paging } from '@/types/instagram';
import { getConversations, getMessages, getAccountInfo } from '@/lib/api';

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [paging, setPaging] = useState<Paging | undefined>(undefined);
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch account info on mount
  useEffect(() => {
    async function fetchAccountInfo() {
      try {
        const response = await getAccountInfo();
        if (response.success && response.data) {
          setAccountInfo(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch account info:', err);
      }
    }
    fetchAccountInfo();
  }, []);

  // Fetch conversations on mount
  useEffect(() => {
    async function fetchConversations() {
      setIsLoadingConversations(true);
      setError(null);
      try {
        const response = await getConversations();
        if (response.success && response.data) {
          setConversations(response.data);
        } else {
          setError(response.error || 'Failed to fetch conversations');
        }
      } catch (err) {
        setError('Failed to connect to server');
      } finally {
        setIsLoadingConversations(false);
      }
    }
    fetchConversations();
  }, []);

  // Fetch messages when conversation is selected
  const selectConversation = useCallback(async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setMessages([]);
    setPaging(undefined);
    setIsLoadingMessages(true);
    setError(null);
    try {
      const response = await getMessages(conversation.id);
      if (response.success && response.data) {
        setMessages(response.data);
        setPaging(response.paging);
      } else {
        setError(response.error || 'Failed to fetch messages');
      }
    } catch (err) {
      setError('Failed to fetch messages');
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  // Load more (older) messages - use 'after' cursor since messages are newest first
  const loadMoreMessages = useCallback(async () => {
    if (!selectedConversation || !paging?.after || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const response = await getMessages(
        selectedConversation.id,
        paging.after,
        'after' // direction: fetch older messages (messages are newest first)
      );
      if (response.success && response.data) {
        // Append older messages after the current ones (array is newest-first)
        setMessages((prev) => [...prev, ...response.data!]);
        setPaging(response.paging);
      }
    } catch (err) {
      console.error('Failed to load more messages:', err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [selectedConversation, paging, isLoadingMore]);

  // Refresh conversations
  const refreshConversations = useCallback(async () => {
    setIsLoadingConversations(true);
    try {
      const response = await getConversations();
      if (response.success && response.data) {
        setConversations(response.data);
      }
    } catch (err) {
      console.error('Failed to refresh conversations:', err);
    } finally {
      setIsLoadingConversations(false);
    }
  }, []);

  // Check if there are more older messages to load
  const hasMoreMessages = paging?.hasMore ?? false;
  return {
    conversations,
    selectedConversation,
    messages,
    paging,
    hasMoreMessages,
    accountInfo,
    isLoadingConversations,
    isLoadingMessages,
    isLoadingMore,
    error,
    selectConversation,
    loadMoreMessages,
    refreshConversations,
  };
}
