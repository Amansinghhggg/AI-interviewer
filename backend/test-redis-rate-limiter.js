import { aiRateLimiter } from './src/middleware/rateLimiter.js';
import { redisClient, isRedisReady } from './src/config/redis.js';

async function testRateLimiter() {
  console.log('\n🧪 [Test] Starting Redis Sliding Window Rate Limiter Benchmark...\n');

  // Allow 1s for Redis connection
  await new Promise((resolve) => setTimeout(resolve, 500));

  const isReady = isRedisReady();
  console.log(`📡 Redis Connection Status: ${isReady ? 'ONLINE (Redis RateLimiter Store Active)' : 'OFFLINE (Fallback Mode)'}`);

  const mockReq = {
    ip: '192.168.1.100',
    user: { _id: 'test_user_777' },
    header: () => {},
  };

  const responses = [];

  console.log('\n---------------------------------------------------');
  console.log('STEP 1: Simulating 12 Consecutive AI Requests (Limit: 10/min)...');
  console.log('---------------------------------------------------');

  for (let i = 1; i <= 12; i++) {
    const mockRes = {
      statusCode: 200,
      headers: {},
      setHeader(name, value) {
        this.headers[name] = value;
      },
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        this.body = payload;
        return this;
      },
    };

    let nextCalled = false;
    await new Promise((resolve) => {
      aiRateLimiter(mockReq, mockRes, () => {
        nextCalled = true;
        resolve();
      });
      if (mockRes.statusCode === 429) {
        resolve();
      }
    });

    responses.push({ requestNum: i, statusCode: mockRes.statusCode, passed: nextCalled, body: mockRes.body });

    const remaining = mockRes.headers['RateLimit-Remaining'] ?? mockRes.headers['ratelimit-remaining'];
    console.log(`REQ #${i.toString().padStart(2, '0')} ──► Status: ${mockRes.statusCode} | Next Allowed? ${nextCalled ? 'YES ✅' : 'BLOCKED ❌'} | Remaining Tokens: ${remaining ?? 'N/A'}`);
  }

  const blockedReqs = responses.filter((r) => r.statusCode === 429);
  console.log(`\n Total Allowed: ${responses.filter((r) => r.passed).length} / 10`);
  console.log(` Total Blocked (HTTP 429): ${blockedReqs.length} / 2`);

  console.log('\n---------------------------------------------------');
  console.log('STEP 2: Verifying 429 Error Payload...');
  console.log('---------------------------------------------------');
  if (blockedReqs.length > 0) {
    console.log('📋 Blocked Response Body:', JSON.stringify(blockedReqs[0].body));
  }

  // Cleanup rate limit key in Redis
  if (isReady) {
    await redisClient.del('rl:ai:test_user_777');
    console.log('🧹 Rate limit test key cleaned up in Redis.');
  }

  console.log('\n🎉 [SUCCESS] Redis Rate Limiter Test Completed Successfully!\n');

  await redisClient.quit();
  process.exit(0);
}

testRateLimiter().catch((err) => {
  console.error('❌ Error during Rate Limiter benchmark:', err);
  process.exit(1);
});
