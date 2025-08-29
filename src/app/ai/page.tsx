'use client';

import { useState } from 'react';

export default function AIPage() {
  const [prompt, setPrompt] = useState('Say hi from the secure API route');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const send = async () => {
    setLoading(true);
    setAnswer('');

    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    if (!res.body) {
      setAnswer('No stream received');
      setLoading(false);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      setAnswer((prev) => prev + chunk);
    }

    setLoading(false);
  };

  return (
    <main className="mx-auto max-w-2xl space-y-4 p-6">
      <h1 className="text-xl font-semibold">AI Tester</h1>
      <textarea
        className="w-full rounded border p-2"
        rows={3}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <button
        onClick={send}
        disabled={loading || !prompt.trim()}
        className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {loading ? 'Thinking…' : 'Ask AI'}
      </button>
      <pre className="whitespace-pre-wrap rounded border bg-gray-50 p-3">{answer}</pre>
    </main>
  );
}
