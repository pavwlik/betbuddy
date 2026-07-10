import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function GroupsPage() {
  const session = await getServerSession(authOptions);
  const userId = (session!.user as any).id as string;

  const memberships = await prisma.membership.findMany({
    where: { userId },
    include: { group: { include: { memberships: true } } },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-black">Moje skupiny</h1>
        <Link
          href="/groups/new"
          className="rounded-full bg-accent px-5 py-2 text-sm font-bold text-black hover:bg-accent-dark"
        >
          + Nová skupina
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {memberships.map((m) => (
          <Link
            key={m.groupId}
            href={`/groups/${m.groupId}`}
            className="rounded-2xl border border-neutral-800 bg-panel p-5 transition hover:border-accent"
          >
            <p className="text-lg font-bold">{m.group.name}</p>
            <p className="text-sm text-neutral-500">{m.group.description}</p>
            <p className="mt-2 text-xs text-accent">{m.group.memberships.length} členů</p>
          </Link>
        ))}
        {memberships.length === 0 && (
          <p className="text-neutral-500">Zatím žádné skupiny.</p>
        )}
      </div>
    </div>
  );
}
