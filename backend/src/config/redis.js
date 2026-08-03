import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

let isRedisConnected = false;

const redisConfig = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null, // Required for BullMQ queues
  retryStrategy(times) {
    // Retry connection up to 3 times, then back off gracefully
    if (times > 3) {
      console.warn('⚠️ [Redis] Unable to reach Redis server. Operating in fallback mode.');
      return null; // Stop retrying automatically
    }
    const delay = Math.min(times * 500, 2000);
    return delay;
  },
  lazyConnect: false,
};

export const redisClient = new Redis(redisConfig);

redisClient.on('connect', () => {
  isRedisConnected = true;
  console.log('⚡ [Redis] Connected successfully to Redis server');
});

redisClient.on('ready', () => {
  isRedisConnected = true;
});

redisClient.on('error', (err) => {
  isRedisConnected = false;
  if (process.env.NODE_ENV !== 'test') {
    console.warn('⚠️ [Redis] Offline or connection error:', err.message);
  }
});

redisClient.on('close', () => {
  isRedisConnected = false;
});

/**
 * Check if Redis is actively connected and ready for commands
 * @returns {boolean}
 */
export const isRedisReady = () => isRedisConnected && redisClient.status === 'ready';
