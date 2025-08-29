'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function AIPage() {
  const [prompt, setPrompt] = useState('Say hi from the secure API route');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async () => {
    if (!prompt.trim()) return;

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
        setError('No stream received from server.');
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

        // Server-Sent Events frames are separated by blank lines
        const frames = buffer.split('\n\n');
        buffer = frames.pop() ?? ''; // keep the last incomplete frame

        for (const frame of frames) {
          const line = frame.trim();
          if (!line.startsWith('data:')) continue;

          const payload = line.replace(/^data:\s*/, '');
          if (payload === '[DONE]') continue;

          try {
            // Chat Completions stream delta format
            const json = JSON.parse(payload) as {
              choices?: Array<{ delta?: { content?: string } }>;
            };
            const delta = json.choices?.[0]?.delta?.content ?? '';
            if (delta) setAnswer((prev) => prev + delta);
          } catch {
            // ignore keep-alives / non-JSON chunks
          }
        }
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setPrompt('');
    setAnswer('');
    setError(null);
  };

  return (
    <main className="mx-auto max-w-2xl p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">AI Chat</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={clear} disabled={loading}>
            Clear
          </Button>
          <Button onClick={send} disabled={loading || !prompt.trim()}>
            {loading ? 'Thinking…' : 'Ask AI'}
          </Button>
        </div>
      </header>

      <Card className="p-4 space-y-3">
        <label className="text-sm font-medium">Prompt</label>
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask something…"
          disabled={loading}
          className="min-h-[120px]"
        />
        <div className="flex items-center gap-2">
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Quick edit (single line)"
            disabled={loading}
          />
          <Button onClick={send} disabled={loading || !prompt.trim()}>
            {loading ? 'Sending…' : 'Send'}
          </Button>
        </div>
      </Card>

      {error ? (
        <Card className="p-4 border-red-300 text-red-700">{error}</Card>
      ) : (
        <Card className="min-h-[160px] whitespace-pre-wrap p-4">{answer || '—'}</Card>
      )}
    </main>
  );
}
