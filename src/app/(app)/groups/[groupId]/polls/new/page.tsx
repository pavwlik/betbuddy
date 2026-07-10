'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function NewPollPage() {
  const router = useRouter();
  const { groupId } = useParams<{ groupId: string }>();
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [closesInMinutes, setClosesInMinutes] = useState(60);
  const [loading, setLoading] = useState(false);

  function updateOption(i: number, value: string) {
    setOptions((prev) => prev.map((o, idx) => (idx === i ? value : o)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`/api/groups/${groupId}/polls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, options, closesInMinutes }),
    });
    setLoading(false);
    if (res.ok) {
      const { poll } = await res.json();
      router.push(`/groups/${groupId}/polls/${poll.id}`);
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-6 text-3xl font-black">Nová anketa</h1>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-neutral-800 bg-panel p-6">
        <div>
          <label className="mb-1 block text-xs uppercase text-neutral-500">Otázka</label>
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Kdo se dnes napije jako první?"
            required
            className="w-full rounded-lg border border-neutral-700 bg-black px-4 py-3 outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs uppercase text-neutral-500">Možnosti</label>
          <div className="space-y-2">
            {options.map((opt, i) => (
              <input
                key={i}
                value={opt}
                onChange={(e) => updateOption(i, e.target.value)}
                placeholder={`Možnost ${i + 1}`}
                className="w-full rounded-lg border border-neutral-700 bg-black px-4 py-3 outline-none focus:border-accent"
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => setOptions((prev) => [...prev, ''])}
            className="mt-2 text-sm font-bold text-accent hover:underline"
          >
            + Přidat možnost
          </button>
        </div>

        <div>
          <label className="mb-1 block text-xs uppercase text-neutral-500">Uzavře se za (minut)</label>
          <input
            type="number"
            min={5}
            value={closesInMinutes}
            onChange={(e) => setClosesInMinutes(Number(e.target.value))}
            className="w-full rounded-lg border border-neutral-700 bg-black px-4 py-3 outline-none focus:border-accent"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 rounded-full border border-neutral-700 py-3 font-bold text-neutral-300 hover:border-accent hover:text-accent"
          >
            Zrušit
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-full bg-accent py-3 font-bold text-black hover:bg-accent-dark disabled:opacity-50"
          >
            {loading ? 'Vytvářím...' : 'Spustit anketu'}
          </button>
        </div>
      </form>
    </div>
  );
}
