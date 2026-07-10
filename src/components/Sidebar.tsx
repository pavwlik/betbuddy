'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/groups', label: 'Moje Skupiny' },
];

export default function Sidebar({
  username,
  points,
}: {
  username: string;
  points: number;
}) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-full shrink-0 flex-col justify-between border-r border-neutral-800 bg-black p-6 md:w-72">
      <div>
        <Link href="/dashboard" className="mb-8 block text-2xl font-black italic text-accent">
          BetBuddy
        </Link>

        <div className="mb-6 flex items-center gap-3 rounded-xl bg-panel p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20 text-accent font-bold">
            {username.slice(0, 1).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-bold">{username}</p>
            <p className="text-xs text-accent">{points} bodů</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-lg px-4 py-3 text-sm font-medium transition ${
                pathname === l.href
                  ? 'bg-accent/10 text-accent border-l-2 border-accent'
                  : 'text-neutral-300 hover:bg-panel'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>

      <button
        onClick={() => signOut({ callbackUrl: '/login' })}
        className="rounded-full border border-neutral-700 py-2 text-sm text-neutral-400 hover:border-accent hover:text-accent"
      >
        Odhlásit se
      </button>
    </aside>
  );
}
