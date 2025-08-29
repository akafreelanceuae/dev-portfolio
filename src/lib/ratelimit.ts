// src/lib/ratelimit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

let _limiter: Ratelimit | null = null;

/**
 * Lazy-initialize the limiter so missing/invalid envs
 * won't crash at import/build time. We'll throw a clear
 * error only when the API route actually runs.
 */
export function getAiLimiter(): Ratelimit {
  if (_limiter) return _limiter;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    throw new Error(
      'Upstash REST env vars missing: set UPSTASH_REDIS_REST_URL (https://...) and UPSTASH_REDIS_REST_TOKEN.',
    );
  }
  if (!url.startsWith('https://')) {
    throw new Error(
      `Invalid Upstash REST URL. Must start with https:// — received: "${url}". Copy the REST URL from the Upstash "REST API" tab (not the redis:// CLI URL).`,
    );
  }

  const redis = new Redis({ url, token });

  _limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(20, '1 m'), // 20 req/min per key
    analytics: true,
    prefix: 'ratelimit:ai',
  });

  return _limiter;
}
