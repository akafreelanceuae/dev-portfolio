// src/app/api/ai/route.ts
import { NextRequest } from 'next/server';
import { getAiLimiter } from '@/lib/ratelimit';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    // --- Rate limit (per IP) ---
    const ipHeader = req.headers.get('x-forwarded-for');
    const ip = ipHeader ? ipHeader.split(',')[0].trim() : '127.0.0.1';

    // Lazy-create limiter and enforce
    const limiter = getAiLimiter();
    const { success, limit, remaining, reset } = await limiter.limit(ip);

    if (!success) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded. Try again later.' }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': String(limit ?? 0),
          'X-RateLimit-Remaining': String(remaining ?? 0),
          'X-RateLimit-Reset': String(reset ?? 0),
        },
      });
    }

    // --- Parse input ---
    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return new Response(JSON.stringify({ error: 'Missing prompt' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // --- API key ---
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Server missing OPENAI_API_KEY' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // --- Call OpenAI (Chat Completions, streaming) ---
    const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        stream: true,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!upstream.ok || !upstream.body) {
      const text = await upstream.text();
      return new Response(JSON.stringify({ error: text || 'Upstream error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // --- Proxy SSE stream to client ---
    return new Response(upstream.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (e) {
    const msg =
      typeof e === 'object' && e !== null && 'message' in e
        ? String((e as { message?: unknown }).message)
        : 'Unknown error';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
