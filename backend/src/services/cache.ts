import { redisClient } from './redis';
import { config } from '../config';
import { CachedMessage } from '../types/instagram';

const CACHE_PREFIX = 'conv:';
const MAX_MESSAGES = 20;

class CacheService {
  /**
   * Generate cache key using business account ID and client account ID pair
   * Format: conv:{businessAccountId}:{clientAccountId}
   */
  private getKey(businessAccountId: string, clientAccountId: string): string {
    return `${CACHE_PREFIX}${businessAccountId}:${clientAccountId}`;
  }

  /**
   * Check if conversation exists in cache
   */
  async hasConversation(businessAccountId: string, clientAccountId: string): Promise<boolean> {
    const exists = await redisClient.exists(this.getKey(businessAccountId, clientAccountId));
    return exists === 1;
  }

  /**
   * Get all cached messages for a conversation
   * Returns messages in chronological order (oldest first)
   */
  async getMessages(businessAccountId: string, clientAccountId: string): Promise<CachedMessage[]> {
    const key = this.getKey(businessAccountId, clientAccountId);
    const rawMessages = await redisClient.lrange(key, 0, -1);

    return rawMessages.map((msg) => JSON.parse(msg) as CachedMessage);
  }

  /**
   * Add a single message to the conversation cache
   * Maintains order (RPUSH) and trims to last 20 messages
   * Resets TTL to 2 hours
   */
  async addMessage(businessAccountId: string, clientAccountId: string, message: CachedMessage): Promise<void> {
    const key = this.getKey(businessAccountId, clientAccountId);
    const serialized = JSON.stringify(message);

    // Use pipeline for atomic operations
    const pipeline = redisClient.pipeline();
    pipeline.rpush(key, serialized);
    pipeline.ltrim(key, -MAX_MESSAGES, -1); // Keep last 20
    pipeline.expire(key, config.cacheTTL);

    await pipeline.exec();
  }

  /**
   * Initialize cache with messages from API
   * Used when cache is empty/expired and we need to fetch from Facebook API
   * Messages should be passed in chronological order (oldest first)
   */
  async setMessages(businessAccountId: string, clientAccountId: string, messages: CachedMessage[]): Promise<void> {
    const key = this.getKey(businessAccountId, clientAccountId);

    // Delete existing key first
    await redisClient.del(key);

    if (messages.length === 0) return;

    // Take only last 20 messages if more provided
    const trimmedMessages = messages.slice(-MAX_MESSAGES);
    const serialized = trimmedMessages.map((msg) => JSON.stringify(msg));

    const pipeline = redisClient.pipeline();
    pipeline.rpush(key, ...serialized);
    pipeline.expire(key, config.cacheTTL);

    await pipeline.exec();
  }

  /**
   * Add business response to cache
   */
  async addBusinessMessage(businessAccountId: string, clientAccountId: string, text: string): Promise<void> {
    const message: CachedMessage = {
      r: 'b',
      t: text,
      ts: Date.now(),
    };
    await this.addMessage(businessAccountId, clientAccountId, message);
  }

  /**
   * Add user message to cache
   */
  async addUserMessage(businessAccountId: string, clientAccountId: string, text: string): Promise<void> {
    const message: CachedMessage = {
      r: 'u',
      t: text,
      ts: Date.now(),
    };
    await this.addMessage(businessAccountId, clientAccountId, message);
  }

  /**
   * Delete conversation cache
   */
  async deleteConversation(businessAccountId: string, clientAccountId: string): Promise<void> {
    await redisClient.del(this.getKey(businessAccountId, clientAccountId));
  }

  /**
   * Get TTL remaining for a conversation (in seconds)
   */
  async getTTL(businessAccountId: string, clientAccountId: string): Promise<number> {
    return redisClient.ttl(this.getKey(businessAccountId, clientAccountId));
  }
}

export const cacheService = new CacheService();
