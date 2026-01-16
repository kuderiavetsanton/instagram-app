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

export interface MessageDetails {
  id: string;
  createdTime: string;
  from: {
    id: string;
    username?: string;
    name?: string;
  };
  message?: string;
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
