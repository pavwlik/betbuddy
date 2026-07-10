import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Sidebar from '@/components/Sidebar';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const userId = (session.user as any).id as string;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) redirect('/login');

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar username={user.username} points={user.points} />
      <main className="flex-1 p-6 md:p-10">{children}</main>
    </div>
  );
}
