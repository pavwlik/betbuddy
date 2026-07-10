import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const usernames = ['petr', 'jana', 'mike', 'alex'];
  const users = [];
  for (const username of usernames) {
    const user = await prisma.user.upsert({
      where: { username },
      update: {},
      create: { username, name: username, points: 1000 },
    });
    users.push(user);
  }

  const group = await prisma.group.create({
    data: {
      name: 'Páteční parta',
      description: 'Víkendoví bojovníci a specialisté na bad beaty.',
      memberships: {
        create: users.map((u, i) => ({ userId: u.id, role: i === 0 ? 'owner' : 'member' })),
      },
    },
  });

  await prisma.poll.create({
    data: {
      groupId: group.id,
      question: 'Kdo dnes dorazí pozdě?',
      closesAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
      options: {
        create: [{ label: 'Mike' }, { label: 'Jana' }, { label: 'Alex' }],
      },
    },
  });

  console.log('Seed complete. Demo users:', usernames.join(', '));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
