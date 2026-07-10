import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const userId = (session.user as any).id as string;
  const { name, description, memberUsernames } = await req.json();

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Group name is required' }, { status: 400 });
  }

  const group = await prisma.group.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      memberships: {
        create: [{ userId, role: 'owner' }],
      },
    },
  });

  // Add any invited friends by username (creates a lightweight account for
  // them if they don't have one yet, same as the demo auth flow).
  if (Array.isArray(memberUsernames)) {
    for (const raw of memberUsernames) {
      const username = String(raw).trim().toLowerCase();
      if (!username) continue;
      const user = await prisma.user.upsert({
        where: { username },
        update: {},
        create: { username, name: username },
      });
      await prisma.membership
        .create({ data: { userId: user.id, groupId: group.id, role: 'member' } })
        .catch(() => {}); // ignore if already a member
    }
  }

  return NextResponse.json({ group });
}
