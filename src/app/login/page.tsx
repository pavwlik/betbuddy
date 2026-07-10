'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim()) return;
    setLoading(true);
    const res = await signIn('credentials', {
      username,
      redirect: false,
    });
    setLoading(false);
    if (res?.ok) router.push('/dashboard');
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <h1 className="mb-1 text-4xl font-black italic tracking-tight text-accent">
        BetBuddy
      </h1>
      <p className="mb-8 text-sm text-neutral-400">
        Ankety a sázky mezi kamarády. Žádné skutečné peníze, jen body.
      </p>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-accent/30 bg-panel p-6 shadow-[0_0_30px_-10px_rgba(199,240,0,0.3)]"
      >
        <label className="mb-2 block text-xs uppercase tracking-wide text-neutral-400">
          Uživatelské jméno
        </label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="napr. petr_bets"
          className="mb-4 w-full rounded-lg border border-neutral-700 bg-black px-4 py-3 text-white outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-accent py-3 font-bold text-black transition hover:bg-accent-dark disabled:opacity-50"
        >
          {loading ? 'Přihlašuji...' : 'Vstoupit'}
        </button>
      </form>
    </main>
  );
}
