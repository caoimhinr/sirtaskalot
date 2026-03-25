import Redis from 'ioredis';

const globalForRedis = globalThis as typeof globalThis & { redis?: Redis };

function createRedis() {
  const client = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
  });
  client.on('error', () => {
    // swallow local connection noise; app falls back to in-memory cache
  });
  return client;
}

export const redis = globalForRedis.redis ?? createRedis();

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis;
}
