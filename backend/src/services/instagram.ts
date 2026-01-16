import axios, { AxiosInstance } from 'axios';
import { config } from '../config';
import {
  IGUser,
  IGConversation,
  IGMessage,
  GraphAPIResponse,
  ConversationListItem,
  PaginatedMessages,
} from '../types/instagram';

interface MessagesResponse {
  data: IGMessage[];
  paging?: {
    cursors?: {
      before: string;
      after: string;
    };
    next?: string;
    previous?: string;
  };
}

class InstagramService {
  private api: AxiosInstance;
  private userInfo: IGUser | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: config.graphApiBaseUrl,
      params: {
        access_token: config.instagramToken,
      },
    });
  }

  async getMe(): Promise<IGUser> {
    const response = await this.api.get<IGUser>('/me', {
      params: {
        fields: 'id,name,username,profile_picture_url',
      },
    });
    this.userInfo = response.data;
    return response.data;
  }

  private async ensureUserInfo(): Promise<IGUser> {
    if (!this.userInfo) {
      await this.getMe();
    }
    return this.userInfo!;
  }

  async getConversations(): Promise<ConversationListItem[]> {
    const currentUser = await this.ensureUserInfo();

    // Use /me/conversations endpoint
    const response = await this.api.get<GraphAPIResponse<IGConversation>>(
      '/me/conversations',
      {
        params: {
          fields: 'id,updated_time,participants{username,name}',
          platform: 'instagram',
        },
      }
    );

    // Filter to only show conversations with exactly 2 participants (1-on-1 chats)
    const twoParticipantConvs = response.data.data.filter(
      (conv) => conv.participants?.data?.length === 2
    );

    return twoParticipantConvs.map((conv) => {
      const participants = conv.participants?.data || [];
      // Find the other participant by comparing username (not ID)
      const otherParticipant = participants.find(
        (p) => p.username !== currentUser.username
      );

      return {
        id: conv.id,
        updatedTime: conv.updated_time,
        participants,
        otherParticipant,
      };
    });
  }

  async getMessages(
    conversationId: string,
    cursor?: string,
    direction: 'before' | 'after' = 'after',
    limit: number = 20
  ): Promise<PaginatedMessages> {
    // Fetch messages using /{conversationId}/messages endpoint
    // Messages are returned newest first, so 'after' cursor gets older messages
    const params: Record<string, string | number> = {
      fields: 'id,created_time,from,to,message',
      limit,
    };

    if (cursor) {
      // Use the cursor for pagination
      params[direction] = cursor;
    }

    const response = await this.api.get<MessagesResponse>(
      `/${conversationId}/messages`,
      { params }
    );

    const messageItems = response.data.data || [];

    // Map message data
    const messages = messageItems.map((msg: IGMessage) => ({
      id: msg.id,
      createdTime: msg.created_time,
      from: msg.from,
      message: msg.message,
    }));

    // Create safe paging info (without URLs that contain access tokens)
    // Note: Messages are returned newest first, so 'after' cursor gets older messages
    const rawPaging = response.data.paging;
    const hasMore = Boolean(rawPaging?.next || rawPaging?.cursors?.after);

    return {
      messages,
      paging: {
        hasMore,
        before: rawPaging?.cursors?.before,
        after: rawPaging?.cursors?.after,
      },
    };
  }
}

export const instagramService = new InstagramService();
