export interface Participant {
  id: string;
  username?: string;
  name?: string;
  profile_picture_url?: string;
}

export interface Conversation {
  id: string;
  updatedTime?: string;
  participants: Participant[];
  otherParticipant?: Participant;
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

export interface Message {
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

export interface Paging {
  hasMore: boolean;
  before?: string;
  after?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  paging?: Paging;
}

export interface AccountInfo {
  id: string;
  name?: string;
  username?: string;
  profile_picture_url?: string;
}
