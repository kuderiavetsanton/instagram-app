import { Router, Request, Response } from 'express';
import { instagramService } from '../services/instagram';

const router = Router();

// GET /api/conversations - List all conversations
router.get('/', async (_req: Request, res: Response) => {
  try {
    const conversations = await instagramService.getConversations();
    res.json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      error: message,
    });
  }
});

// GET /api/conversations/:id/messages - Get messages for a conversation
// Query params: cursor (optional), direction ('before'|'after', default 'before'), limit (optional, default 20)
router.get('/:id/messages', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const cursor = req.query.cursor as string | undefined;
    const direction = (req.query.direction as 'before' | 'after') || 'before';
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

    const result = await instagramService.getMessages(id, cursor, direction, limit);
    res.json({
      success: true,
      data: result.messages,
      paging: result.paging,
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      error: message,
    });
  }
});

export default router;
