export interface IGUser {
  id: string;
  name?: string;
  username?: string;
  profile_picture_url?: string;
}

export interface IGParticipant {
  id: string;
  username?: string;
  name?: string;
  profile_picture_url?: string;
}

export interface IGAttachment {
  id: string;
  mime_type: string;
  name?: string;
  size?: number;
  video_data?: {
    width: number;
    height: number;
    url: string;
    preview_url?: string;
  };
  image_data?: {
    width: number;
    height: number;
    url: string;
    preview_url?: string;
    max_width?: number;
    max_height?: number;
  };
  file_url?: string;
}

export interface IGShare {
  link?: string;
  name?: string;
  description?: string;
}

export interface IGMessage {
  id: string;
  created_time: string;
  from: {
    id: string;
    username?: string;
    name?: string;
  };
  to: {
    data: Array<{
      id: string;
      username?: string;
      name?: string;
    }>;
  };
  message?: string;
  attachments?: {
    data: IGAttachment[];
  };
  shares?: {
    data: IGShare[];
  };
}

export interface IGConversation {
  id: string;
  updated_time?: string;
  participants?: {
    data: IGParticipant[];
  };
  messages?: {
    data: Array<{ id: string }>;
  };
}

export interface GraphAPIResponse<T> {
  data: T[];
  paging?: {
    cursors?: {
      before: string;
      after: string;
    };
    next?: string;
    previous?: string;
  };
}

export interface ConversationListItem {
  id: string;
  updatedTime?: string;
  participants: IGParticipant[];
  otherParticipant?: IGParticipant; // The other person in the conversation
}

export interface Attachment {
  id: string;
  mimeType: string;
  name?: string;
  size?: number;
  url?: string;
  previewUrl?: string;
  width?: number;
  height?: number;
  type: 'image' | 'video' | 'file';
}

export interface Share {
  link?: string;
  name?: string;
  description?: string;
}

export interface MessageDetails {
  id: string;
  createdTime: string;
  from: {
    id: string;
    username?: string;
    name?: string;
  };
  message?: string;
  attachments?: Attachment[];
  shares?: Share[];
}

// Safe pagination info to send to client (excludes URLs with access tokens)
export interface SafePaging {
  hasMore: boolean;
  before?: string;
  after?: string;
}

export interface PaginatedMessages {
  messages: MessageDetails[];
  paging: SafePaging;
}

// Cache message format - compact for Redis storage
export interface CachedMessage {
  r: 'u' | 'b'; // role: 'u' = user, 'b' = business
  t: string;    // text content
  ts: number;   // timestamp (unix ms)
}

// Webhook payload types from Instagram
export interface WebhookEntry {
  id: string;
  time: number;
  messaging: WebhookMessaging[];
}

export interface WebhookMessaging {
  sender: { id: string };
  recipient: { id: string };
  timestamp: number;
  message?: {
    mid: string;
    text?: string;
    is_echo?: boolean;
    attachments?: Array<{
      type: string;
      payload: { url: string };
    }>;
  };
}

export interface WebhookPayload {
  object: string;
  entry: WebhookEntry[];
}
