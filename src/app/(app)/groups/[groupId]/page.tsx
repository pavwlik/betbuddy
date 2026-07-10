import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { computeOdds } from '@/lib/odds';

export default async function GroupPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      memberships: { include: { user: true } },
      polls: {
        orderBy: { createdAt: 'desc' },
        include: { options: true, bets: true, votes: true },
      },
    },
  });

  if (!group) notFound();

  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-sm text-accent">
        <span>{group.memberships.length} členů</span>
      </div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">{group.name}</h1>
          <p className="text-neutral-400">{group.description}</p>
        </div>
        <Link
          href={`/groups/${group.id}/polls/new`}
          className="rounded-full bg-accent px-5 py-2 text-sm font-bold text-black hover:bg-accent-dark"
        >
          + Nová anketa
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {group.polls.map((poll) => {
          const pools = poll.options.map((o) => ({
            optionId: o.id,
            totalStaked: poll.bets
              .filter((b) => b.optionId === o.id)
              .reduce((s, b) => s + b.amount, 0),
          }));
          const odds = computeOdds(pools);
          const totalVotes = poll.votes.length;

          return (
            <Link
              key={poll.id}
              href={`/groups/${group.id}/polls/${poll.id}`}
              className="rounded-2xl border border-neutral-800 bg-panel p-5 transition hover:border-accent"
            >
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="rounded bg-black px-2 py-1 uppercase text-neutral-400">
                  {poll.status === 'open' ? 'Otevřeno' : poll.status === 'closed' ? 'Uzavřeno' : 'Vyhodnoceno'}
                </span>
                <span className="text-neutral-500">{totalVotes} hlasů</span>
              </div>
              <p className="mb-3 font-bold">{poll.question}</p>
              <div className="space-y-1">
                {poll.options.slice(0, 3).map((o) => (
                  <div key={o.id} className="flex justify-between text-sm">
                    <span className="text-neutral-300">{o.label}</span>
                    <span className="font-bold text-accent">{odds[o.id].toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </Link>
          );
        })}
        {group.polls.length === 0 && (
          <p className="text-neutral-500">Zatím žádné ankety v této skupině.</p>
        )}
      </div>
    </div>
  );
}
