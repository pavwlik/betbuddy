import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { computeOdds, computeOpeningOddsFromVotes } from '@/lib/odds';

export async function GET(_req: Request, { params }: { params: Promise<{ pollId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const userId = (session.user as any).id as string;
  const { pollId } = await params;

  const poll = await prisma.poll.findUnique({
    where: { id: pollId },
    include: {
      options: true,
      bets: true,
      votes: true,
      group: { select: { id: true, name: true } },
    },
  });
  if (!poll) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const myVote = poll.votes.find((v) => v.userId === userId);
  const myBets = poll.bets.filter((b) => b.userId === userId);
  const hasVoted = Boolean(myVote);
  const isClosed = poll.status !== 'open' || new Date() > poll.closesAt;
  const unlocked = hasVoted || isClosed;

  const totalVotes = poll.votes.length;
  const voteCounts = poll.options.map((o) => ({
    optionId: o.id,
    count: poll.votes.filter((v) => v.optionId === o.id).length,
  }));

  const odds =
    poll.bets.length > 0
      ? computeOdds(
          poll.options.map((o) => ({
            optionId: o.id,
            totalStaked: poll.bets
              .filter((b) => b.optionId === o.id)
              .reduce((s, b) => s + b.amount, 0),
          }))
        )
      : computeOpeningOddsFromVotes(voteCounts);

  return NextResponse.json({
    id: poll.id,
    question: poll.question,
    status: poll.status,
    closesAt: poll.closesAt,
    group: poll.group,
    hasVoted,
    myVoteOptionId: myVote?.optionId ?? null,
    myBets: myBets.map((b) => ({
      id: b.id,
      optionId: b.optionId,
      amount: b.amount,
      oddsAtBet: b.oddsAtBet,
      status: b.status,
    })),
    unlocked,
    totalVotes: unlocked ? totalVotes : null,
    options: poll.options.map((o) => ({
      id: o.id,
      label: o.label,
      odds: odds[o.id],
      votePercentage: unlocked
        ? totalVotes
          ? Math.round(
              (voteCounts.find((v) => v.optionId === o.id)!.count / totalVotes) * 100
            )
          : 0
        : null,
    })),
  });
}
