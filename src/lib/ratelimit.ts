// src/lib/ratelimit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  // Optional: avoid noisy logs in dev
  // eslint-disable-next-line no-console
  console.warn(
    '[ratelimit] Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN. Rate limiting will fail.',
  );
}

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

export const aiLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(20, '1 m'), // 20 requests per minute per identifier
  analytics: true,
  prefix: 'ratelimit:ai',
});
