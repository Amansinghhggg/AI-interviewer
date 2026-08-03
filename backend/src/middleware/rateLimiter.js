import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redisClient, isRedisReady } from '../config/redis.js';

/**
 * Helper to build a Redis-backed or Memory-backed Rate Limiter Store
 */
const getLimiterStore = (prefix) => {
  if (isRedisReady()) {
    try {
      return new RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
        prefix: `rl:${prefix}:`,
      });
    } catch (err) {
      console.warn(`⚠️ [RateLimiter] Error initializing Redis store for '${prefix}':`, err.message);
    }
  }
  return undefined; // Falls back to default MemoryStore
};

/**
 * Strict Rate Limiter for AI-heavy endpoints (Gemini / Groq LLM & Speech)
 * Limit: 10 requests per 1 minute window per IP / User
 */
export const aiRateLimiter = rateLimit({
  store: getLimiterStore('ai'),
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Max 10 requests per minute
  standardHeaders: true, // Return RateLimit-* headers
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Prefer authenticated user ID if available, otherwise IP
    return req.user?._id ? String(req.user._id) : req.ip;
  },
  handler: (req, res) => {
    console.warn(`🚨 [RateLimiter] AI Rate limit exceeded for IP/User: ${req.user?._id || req.ip}`);
    res.status(429).json({
      success: false,
      error: 'too_many_requests',
      message: 'Too many AI requests. Please wait 1 minute before trying again to protect AI quotas.',
      retryAfterSeconds: 60,
    });
  },
});

/**
 * Strict Rate Limiter for Auth endpoints (Login / Signup)
 * Limit: 5 requests per 1 minute window per IP
 */
export const authRateLimiter = rateLimit({
  store: getLimiterStore('auth'),
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // Max 5 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.warn(`🚨 [RateLimiter] Auth Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      error: 'too_many_auth_attempts',
      message: 'Too many login attempts. Please wait 1 minute before trying again.',
      retryAfterSeconds: 60,
    });
  },
});
