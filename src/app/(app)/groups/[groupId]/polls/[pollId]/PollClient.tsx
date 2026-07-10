'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

interface PollOption {
  id: string;
  label: string;
  odds: number;
  votePercentage: number | null;
}

interface PollData {
  id: string;
  question: string;
  status: string;
  closesAt: string;
  group: { id: string; name: string };
  hasVoted: boolean;
  myVoteOptionId: string | null;
  myBets: { id: string; optionId: string; amount: number; oddsAtBet: number; status: string }[];
  unlocked: boolean;
  totalVotes: number | null;
  options: PollOption[];
}

export default function PollClient({ groupId, pollId }: { groupId: string; pollId: string }) {
  const [poll, setPoll] = useState<PollData | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [stake, setStake] = useState(10);
  const [error, setError] = useState<string | null>(null);
  const [voting, setVoting] = useState(false);
  const [betting, setBetting] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/polls/${pollId}`);
    if (res.ok) setPoll(await res.json());
  }, [pollId]);

  useEffect(() => {
    load();
  }, [load]);

  async function castVote(optionId: string) {
    setVoting(true);
    setError(null);
    const res = await fetch(`/api/polls/${pollId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ optionId }),
    });
    setVoting(false);
    if (res.ok) {
      await load();
    } else {
      const { error } = await res.json();
      setError(error);
    }
  }

  async function placeBet() {
    if (!selectedOption) return;
    setBetting(true);
    setError(null);
    const res = await fetch(`/api/polls/${pollId}/bet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ optionId: selectedOption, amount: stake }),
    });
    setBetting(false);
    if (res.ok) {
      setSelectedOption(null);
      await load();
    } else {
      const { error } = await res.json();
      setError(error);
    }
  }

  if (!poll) {
    return <p className="text-neutral-500">Načítám anketu...</p>;
  }

  const selectedOdds = poll.options.find((o) => o.id === selectedOption)?.odds ?? 0;
  const toWin = Math.round(stake * selectedOdds * 100) / 100;

  return (
    <div className="mx-auto max-w-xl">
      <Link href={`/groups/${groupId}`} className="mb-4 inline-block text-sm text-accent hover:underline">
        ← {poll.group.name}
      </Link>

      <div className="mb-4 flex items-center justify-between">
        <span className="rounded bg-black px-2 py-1 text-xs uppercase text-neutral-400">
          {poll.status === 'open' ? 'Otevřeno' : 'Uzavřeno'}
        </span>
        <span className="text-xs text-neutral-500">
          Uzávěrka: {new Date(poll.closesAt).toLocaleString('cs-CZ')}
        </span>
      </div>

      <h1 className="mb-6 text-2xl font-black">{poll.question}</h1>

      {error && <p className="mb-4 rounded-lg bg-red-950 px-4 py-2 text-sm text-red-400">{error}</p>}

      {!poll.unlocked ? (
        <>
          <p className="mb-3 text-sm text-neutral-400">
            Hlasuj, abys odemkl/a statistiky a kurzy. Nikdo neuvidí, jak jsi hlasoval/a.
          </p>
          <div className="space-y-3">
            {poll.options.map((o) => (
              <button
                key={o.id}
                onClick={() => castVote(o.id)}
                disabled={voting}
                className="w-full rounded-xl border border-neutral-800 bg-panel2 px-4 py-3 text-left font-medium transition hover:border-accent disabled:opacity-50"
              >
                {o.label}
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <p className="mb-3 text-sm text-neutral-400">
            {poll.totalVotes} {poll.totalVotes === 1 ? 'hlas' : 'hlasů'} — vyber možnost a vsaď body
          </p>
          <div className="space-y-3">
            {poll.options.map((o) => (
              <div key={o.id} className="relative">
                <button
                  onClick={() => setSelectedOption(o.id)}
                  className={`relative flex w-full items-center justify-between overflow-hidden rounded-xl border px-4 py-3 text-left transition ${
                    selectedOption === o.id
                      ? 'border-accent bg-accent/10'
                      : 'border-neutral-800 bg-panel2 hover:border-accent'
                  }`}
                >
                  {typeof o.votePercentage === 'number' && (
                    <div
                      className="absolute inset-y-0 left-0 bg-accent/10"
                      style={{ width: `${o.votePercentage}%` }}
                    />
                  )}
                  <span className="relative z-10 font-medium">
                    {o.label}
                    {poll.myVoteOptionId === o.id && (
                      <span className="ml-2 text-xs text-accent">(tvůj hlas)</span>
                    )}
                  </span>
                  <span className="relative z-10 flex items-center gap-2">
                    {typeof o.votePercentage === 'number' && (
                      <span className="text-xs text-neutral-500">{o.votePercentage}%</span>
                    )}
                    <span className="rounded-md bg-black px-3 py-1 font-bold text-accent">
                      {o.odds.toFixed(2)}
                    </span>
                  </span>
                </button>
              </div>
            ))}
          </div>

          {poll.status === 'open' && (
            <div className="mt-6 rounded-2xl border border-neutral-800 bg-panel p-5">
              <div className="mb-3 flex items-center justify-between">
                <label className="text-xs uppercase text-neutral-500">Vklad (body)</label>
                <span className="text-xs text-neutral-500">
                  Výhra: <span className="font-bold text-accent">{toWin || '—'}</span>
                </span>
              </div>
              <div className="flex gap-3">
                <input
                  type="number"
                  min={1}
                  value={stake}
                  onChange={(e) => setStake(Number(e.target.value))}
                  className="w-32 rounded-lg border border-neutral-700 bg-black px-4 py-3 outline-none focus:border-accent"
                />
                <button
                  onClick={placeBet}
                  disabled={!selectedOption || betting}
                  className="flex-1 rounded-full bg-accent py-3 font-bold text-black hover:bg-accent-dark disabled:opacity-50"
                >
                  {betting ? 'Sázím...' : selectedOption ? 'Vsadit' : 'Vyber možnost'}
                </button>
              </div>
            </div>
          )}

          {poll.myBets.length > 0 && (
            <div className="mt-6">
              <h2 className="mb-2 text-sm font-bold text-neutral-400">Tvoje sázky</h2>
              <div className="space-y-2">
                {poll.myBets.map((b) => {
                  const opt = poll.options.find((o) => o.id === b.optionId);
                  return (
                    <div
                      key={b.id}
                      className="flex justify-between rounded-lg border border-neutral-800 bg-panel2 px-4 py-2 text-sm"
                    >
                      <span>{opt?.label}</span>
                      <span className="text-neutral-400">
                        {b.amount} @ <span className="text-accent">{b.oddsAtBet.toFixed(2)}</span>
                      </span>
                      <span className="capitalize text-neutral-500">{b.status}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
