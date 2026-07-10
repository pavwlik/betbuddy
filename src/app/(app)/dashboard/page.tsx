import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = (session!.user as any).id as string;

  const memberships = await prisma.membership.findMany({
    where: { userId },
    include: {
      group: {
        include: {
          polls: { where: { status: 'open' } },
        },
      },
    },
  });

  const bets = await prisma.bet.findMany({ where: { userId } });
  const settled = bets.filter((b) => b.status !== 'pending');
  const won = settled.filter((b) => b.status === 'won');
  const winRate = settled.length ? Math.round((won.length / settled.length) * 100) : 0;

  return (
    <div>
      <h1 className="text-3xl font-black">Vítej zpátky.</h1>
      <p className="mb-8 text-neutral-400">Akce se rozjíždí ve tvých skupinách.</p>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-neutral-800 bg-panel p-5">
          <p className="text-xs uppercase text-neutral-500">Aktivní sázky</p>
          <p className="text-3xl font-black">{bets.filter((b) => b.status === 'pending').length}</p>
        </div>
        <div className="rounded-2xl border border-neutral-800 bg-panel p-5">
          <p className="text-xs uppercase text-neutral-500">Úspěšnost</p>
          <p className="text-3xl font-black text-accent">{winRate}%</p>
        </div>
        <div className="rounded-2xl border border-neutral-800 bg-panel p-5">
          <p className="text-xs uppercase text-neutral-500">Skupiny</p>
          <p className="text-3xl font-black">{memberships.length}</p>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">Aktivní skupiny</h2>
        <Link href="/groups/new" className="text-sm font-bold text-accent hover:underline">
          + Nová skupina
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {memberships.length === 0 && (
          <p className="text-neutral-500">Zatím nejsi v žádné skupině. Založ první!</p>
        )}
        {memberships.map((m) => (
          <Link
            key={m.groupId}
            href={`/groups/${m.groupId}`}
            className="rounded-2xl border border-neutral-800 bg-panel p-5 transition hover:border-accent"
          >
            <p className="font-bold">{m.group.name}</p>
            <p className="text-sm text-neutral-500">{m.group.polls.length} otevřených anket</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
