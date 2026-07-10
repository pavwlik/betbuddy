'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewGroupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [members, setMembers] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const memberUsernames = members
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean);

    const res = await fetch('/api/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, memberUsernames }),
    });
    setLoading(false);

    if (res.ok) {
      const { group } = await res.json();
      router.push(`/groups/${group.id}`);
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-6 text-3xl font-black">Vytvořit skupinu</h1>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-neutral-800 bg-panel p-6">
        <div>
          <label className="mb-1 block text-xs uppercase text-neutral-500">Název skupiny</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="např. Páteční parta"
            required
            className="w-full rounded-lg border border-neutral-700 bg-black px-4 py-3 outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs uppercase text-neutral-500">Popis (volitelné)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="O čem tahle skupina je?"
            className="w-full rounded-lg border border-neutral-700 bg-black px-4 py-3 outline-none focus:border-accent"
            rows={3}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs uppercase text-neutral-500">
            Pozvat členy (uživatelská jména oddělená čárkou)
          </label>
          <input
            value={members}
            onChange={(e) => setMembers(e.target.value)}
            placeholder="petr, jana, mikeR"
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
            {loading ? 'Vytvářím...' : 'Vytvořit skupinu'}
          </button>
        </div>
      </form>
    </div>
  );
}
