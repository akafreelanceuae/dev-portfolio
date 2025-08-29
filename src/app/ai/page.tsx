'use client';

import { useState } from 'react';

export default function AIPage() {
  const [prompt, setPrompt] = useState('Say hi from the secure API route');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async () => {
    setLoading(true);
    setAnswer('');
    setError(null);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok || !res.body) {
        setError('No stream received');
        setLoading(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // SSE frames are separated by a blank line
        const parts = buffer.split('\n\n');
        // Keep the last (possibly incomplete) frame in buffer
        buffer = parts.pop() ?? '';

        for (const part of parts) {
          // Each frame line typically starts with "data: "
          const line = part.trim();
          if (!line.startsWith('data:')) continue;

          const payload = line.replace(/^data:\s*/, '');

          if (payload === '[DONE]') {
            // Stream finished
            continue;
          }

          try {
            const json = JSON.parse(payload) as {
              choices?: Array<{ delta?: { content?: string } }>;
            };

            const delta = json.choices?.[0]?.delta?.content ?? '';
            if (delta) {
              // Append only the text, not the raw JSON
              setAnswer((prev) => prev + delta);
            }
          } catch (_e) {
            // Ignore non-JSON keep-alive frames
          }
        }
      }
    } catch (e) {
      setError((e as Error).message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-2xl space-y-4 p-6">
      <h1 className="text-xl font-semibold">AI Tester</h1>

      <textarea
        className="w-full rounded border p-3 bg-transparent"
        rows={3}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Ask something…"
        disabled={loading}
      />

      <button
        onClick={send}
        disabled={loading || !prompt.trim()}
        className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {loading ? 'Thinking…' : 'Ask AI'}
      </button>

      {error ? (
        <div className="rounded border border-red-400 bg-red-50 p-3 text-red-700">
          {error}
        </div>
      ) : (
        <pre className="whitespace-pre-wrap rounded border bg-gray-50 p-3 min-h-[120px]">
          {answer || '—'}
        </pre>
      )}
    </main>
  );
}
