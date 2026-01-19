import { ApiResponse, Conversation, Message, AccountInfo } from '@/types/instagram';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function fetchApi<T>(endpoint: string): Promise<ApiResponse<T>> {
  const response = await fetch(`${API_BASE}${endpoint}`);
  return response.json();
}

export async function getAccountInfo(): Promise<ApiResponse<AccountInfo>> {
  return fetchApi<AccountInfo>('/api/me');
}

export async function getConversations(): Promise<ApiResponse<Conversation[]>> {
  return fetchApi<Conversation[]>('/api/conversations');
}

export async function getMessages(
  conversationId: string,
  cursor?: string,
  direction: 'before' | 'after' = 'before',
  limit: number = 20
): Promise<ApiResponse<Message[]>> {
  let url = `/api/conversations/${conversationId}/messages?limit=${limit}&direction=${direction}`;
  if (cursor) {
    url += `&cursor=${encodeURIComponent(cursor)}`;
  }
  return fetchApi<Message[]>(url);
}
