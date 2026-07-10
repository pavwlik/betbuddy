import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { computeOdds, computeOpeningOddsFromVotes } from '@/lib/odds';

export async function POST(req: Request, { params }: { params: Promise<{ pollId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const userId = (session.user as any).id as string;
  const { pollId } = await params;
  const { optionId, amount } = await req.json();
  const stake = Math.floor(Number(amount));

  if (!optionId || !stake || stake <= 0) {
    return NextResponse.json({ error: 'Invalid bet' }, { status: 400 });
  }

  const poll = await prisma.poll.findUnique({
    where: { id: pollId },
    include: { options: true, bets: true, votes: true },
  });
  if (!poll) return NextResponse.json({ error: 'not found' }, { status: 404 });
  if (poll.status !== 'open') {
    return NextResponse.json({ error: 'Anketa je uzavřená' }, { status: 400 });
  }
  if (new Date() > poll.closesAt) {
    return NextResponse.json({ error: 'Anketa je po uzávěrce' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.points < stake) {
    return NextResponse.json({ error: 'Nedostatek bodů' }, { status: 400 });
  }

  // Lock in current odds (pool-based once bets exist, vote-based before that)
  const oddsMap =
    poll.bets.length > 0
      ? computeOdds(
          poll.options.map((o) => ({
            optionId: o.id,
            totalStaked: poll.bets
              .filter((b) => b.optionId === o.id)
              .reduce((s, b) => s + b.amount, 0),
          }))
        )
      : computeOpeningOddsFromVotes(
          poll.options.map((o) => ({
            optionId: o.id,
            count: poll.votes.filter((v) => v.optionId === o.id).length,
          }))
        );

  const odds = oddsMap[optionId];
  if (!odds) return NextResponse.json({ error: 'Invalid option' }, { status: 400 });

  const [, bet] = await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { points: { decrement: stake } },
    }),
    prisma.bet.create({
      data: {
        pollId: pollId,
        optionId,
        userId,
        amount: stake,
        oddsAtBet: odds,
      },
    }),
  ]);

  return NextResponse.json({ bet });
}
