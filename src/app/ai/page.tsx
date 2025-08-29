'use client';

import { useState } from 'react';

export default function AIPage() {
  const [prompt, setPrompt] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const send = async () => {
    setLoading(true);
    setAnswer('');
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
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
      setAnswer(prev => prev + decoder.decode(value, { stream: true }));
    }

    setLoading(false);
  };

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-xl font-semibold">AI Tester</h1>
      <textarea
        className="w-full border rounded p-2"
        rows={3}
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
      />
      <button
        onClick={send}
        disabled={loading || !prompt.trim()}
        className="px-4 py-2 bg-black text-white rounded"
      >
        {loading ? 'Thinking…' : 'Ask AI'}
      </button>
      <pre className="whitespace-pre-wrap border rounded p-3 bg-gray-50">{answer}</pre>
    </main>
  );
}
