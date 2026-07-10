import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// IMPORTANT: this route only ever returns aggregated counts. It never
// returns which user cast which vote, to any caller, including the poll
// creator. That's the whole point of "gut feeling" polls being anonymous.
export async function POST(req: Request, { params }: { params: Promise<{ pollId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const userId = (session.user as any).id as string;
  const { pollId } = await params;
  const { optionId } = await req.json();

  const poll = await prisma.poll.findUnique({ where: { id: pollId } });
  if (!poll) return NextResponse.json({ error: 'not found' }, { status: 404 });
  if (poll.status !== 'open') {
    return NextResponse.json({ error: 'poll is closed' }, { status: 400 });
  }

  await prisma.vote.upsert({
    where: { pollId_userId: { pollId: pollId, userId } },
    update: { optionId },
    create: { pollId: pollId, optionId, userId },
  });

  const counts = await prisma.vote.groupBy({
    by: ['optionId'],
    where: { pollId: pollId },
    _count: { optionId: true },
  });

  return NextResponse.json({
    counts: counts.map((c) => ({ optionId: c.optionId, count: c._count.optionId })),
  });
}
