import express from 'express';
import cors from 'cors';
import { config } from './config';
import conversationsRouter from './routes/conversations';
import webhookRouter from './routes/webhook';
import { instagramService } from './services/instagram';
import { redisService } from './services/redis';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/conversations', conversationsRouter);
app.use('/api/webhook/instagram', webhookRouter);

// Health check / account info endpoint
app.get('/api/me', async (_req, res) => {
  try {
    const me = await instagramService.getMe();
    res.json({
      success: true,
      data: me,
    });
  } catch (error) {
    console.error('Error fetching account info:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      error: message,
    });
  }
});

// Start server
app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
  console.log('Available endpoints:');
  console.log(`  GET  /api/me - Account info`);
  console.log(`  GET  /api/conversations - List conversations`);
  console.log(`  GET  /api/conversations/:id/messages - Get messages`);
  console.log(`  GET  /api/webhook/instagram - Webhook verification`);
  console.log(`  POST /api/webhook/instagram - Webhook events`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down...');
  await redisService.disconnect();
  process.exit(0);
});
