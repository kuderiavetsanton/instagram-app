import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const config = {
  port: process.env.PORT || 3001,
  instagramToken: process.env.INSTAGRAM_TOKEN || '',
  graphApiBaseUrl: 'https://graph.instagram.com/v24.0',
  // Redis
  redisHost: process.env.REDIS_HOST || 'localhost',
  redisPort: parseInt(process.env.REDIS_PORT || '6379', 10),
  // Webhook
  igVerifyToken: process.env.IG_VERIFY_TOKEN || '',
  // Cache TTL (2 hours in seconds)
  cacheTTL: 7200,
};

if (!config.instagramToken) {
  console.error('ERROR: INSTAGRAM_TOKEN is not set in .env file');
  process.exit(1);
}
