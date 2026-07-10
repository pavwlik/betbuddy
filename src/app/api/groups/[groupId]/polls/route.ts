import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { groupId } = await params;
  const { question, options, closesInMinutes } = await req.json();

  if (!question?.trim() || !Array.isArray(options) || options.filter(Boolean).length < 2) {
    return NextResponse.json(
      { error: 'Question and at least 2 options are required' },
      { status: 400 }
    );
  }

  const closesAt = new Date(Date.now() + (Number(closesInMinutes) || 60) * 60_000);

  const poll = await prisma.poll.create({
    data: {
      groupId,
      question: question.trim(),
      closesAt,
      options: {
        create: options
          .filter((o: string) => o.trim())
          .map((label: string) => ({ label: label.trim() })),
      },
    },
    include: { options: true },
  });

  return NextResponse.json({ poll });
}
