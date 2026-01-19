import { Router, Request, Response } from 'express';
import { config } from '../config';
import { cacheService } from '../services/cache';
import { instagramService } from '../services/instagram';
import { WebhookPayload, CachedMessage } from '../types/instagram';

const router = Router();

/**
 * GET /api/webhook/instagram
 * Webhook verification endpoint for Meta
 */
router.get('/', (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log('Webhook verification request:', { mode, token: token ? '***' : 'missing' });

  if (mode === 'subscribe' && token === config.igVerifyToken) {
    console.log('Webhook verified successfully');
    res.status(200).send(challenge);
  } else {
    console.error('Webhook verification failed');
    res.sendStatus(403);
  }
});

/**
 * POST /api/webhook/instagram
 * Handle incoming messages from Instagram
 */
router.post('/', async (req: Request, res: Response) => {
  console.log('Webhook request received');
  // Immediately return 200 to acknowledge receipt (Meta requires quick response)
  res.sendStatus(200);

  try {
    const payload = req.body as WebhookPayload;

    // Log payload for debugging during initial setup
    console.log('Webhook payload:', JSON.stringify(payload, null, 2));

    if (payload.object !== 'instagram') {
      return;
    }

    for (const entry of payload.entry) {
      const businessAccountId = entry.id;

      for (const messaging of entry.messaging || []) {
        const messageText = messaging.message?.text;
        const isEcho = messaging.message?.is_echo === true;

        // Skip if no text message (could be attachment-only)
        if (!messageText) {
          console.log('Received non-text message, is_echo:', isEcho);
          continue;
        }

        // Determine client ID based on is_echo:
        // - is_echo=true: we (business) sent it -> sender=business, recipient=client
        // - is_echo=false: client sent it -> sender=client, recipient=business
        const clientAccountId = isEcho ? messaging.recipient.id : messaging.sender.id;

        console.log(`Message ${isEcho ? 'sent to' : 'from'} ${clientAccountId}: ${messageText}`);

        await processIncomingMessage(businessAccountId, clientAccountId, messageText, isEcho);
      }
    }
  } catch (error) {
    // Log error but don't fail - we already sent 200
    console.error('Error processing webhook:', error);
  }
});

/**
 * Process an incoming message:
 * 1. Check if conversation exists in cache (using businessAccountId:clientAccountId key)
 * 2. If not, fetch last 20 messages from API and populate cache
 * 3. Add new message to cache
 * 4. (Future: Invoke AI agent with context)
 */
async function processIncomingMessage(
  businessAccountId: string,
  clientAccountId: string,
  messageText: string,
  isEcho: boolean
): Promise<void> {
  const hasCache = await cacheService.hasConversation(businessAccountId, clientAccountId);

  if (!hasCache) {
    console.log(`Cache miss for ${businessAccountId}:${clientAccountId}, fetching from API...`);
    await populateCacheFromAPI(businessAccountId, clientAccountId);
  }

  // Add message to cache based on who sent it
  if (isEcho) {
    // Business sent this message
    await cacheService.addBusinessMessage(businessAccountId, clientAccountId, messageText);
  } else {
    // Client sent this message
    await cacheService.addUserMessage(businessAccountId, clientAccountId, messageText);
  }

  // Get full conversation context for AI agent
  const context = await cacheService.getMessages(businessAccountId, clientAccountId);
  console.log(`Conversation context for ${businessAccountId}:${clientAccountId}:`, context.length, 'messages');

  // TODO: Invoke AI agent with context (only for non-echo messages)
  // if (!isEcho) {
  //   const response = await aiAgent.respond(context);
  //   await sendInstagramMessage(clientAccountId, response);
  //   await cacheService.addBusinessMessage(businessAccountId, clientAccountId, response);
  // }
}

/**
 * Fetch messages from Facebook API and populate cache
 * Note: API returns messages newest-first, we need to reverse for chronological order
 *
 * This function finds the conversation ID internally (only called on cache miss)
 */
async function populateCacheFromAPI(businessAccountId: string, clientAccountId: string): Promise<void> {
  try {
    // Find conversation ID for this client
    const conversations = await instagramService.getConversations();
    const conversation = conversations.find((conv) =>
      conv.participants.some((p) => p.id === clientAccountId)
    );

    if (!conversation) {
      console.error(`Could not find conversation for client ${clientAccountId}`);
      return;
    }

    const conversationId = conversation.id;

    // Fetch last 20 messages
    const result = await instagramService.getMessages(conversationId, undefined, 'after', 20);

    // Convert to cached format and reverse to chronological order
    // Use clientAccountId to determine message role
    const cachedMessages: CachedMessage[] = result.messages
      .map((msg) => ({
        r: (msg.from.id === clientAccountId ? 'u' : 'b') as 'u' | 'b',
        t: msg.message || '[attachment]',
        ts: new Date(msg.createdTime).getTime(),
      }))
      .reverse(); // API returns newest first, we want oldest first

    await cacheService.setMessages(businessAccountId, clientAccountId, cachedMessages);
    console.log(`Populated cache for ${businessAccountId}:${clientAccountId} with ${cachedMessages.length} messages`);
  } catch (error) {
    console.error(`Failed to populate cache for ${businessAccountId}:${clientAccountId}:`, error);
  }
}

export default router;
