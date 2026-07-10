import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';

/**
 * DEMO AUTH: sign in with just a username, no password. Good enough to
 * develop and demo the group/poll/betting flows.
 *
 * For a real deployment, swap this provider for Google/Apple/email-magic-link
 * (Auth.js supports all of these out of the box) so people can't spoof
 * being someone else in a friend group.
 */
export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Username',
      credentials: {
        username: { label: 'Username', type: 'text' },
      },
      async authorize(credentials) {
        const username = credentials?.username?.trim().toLowerCase();
        if (!username) return null;

        const user = await prisma.user.upsert({
          where: { username },
          update: {},
          create: {
            username,
            name: username,
            points: 1000,
          },
        });

        return {
          id: user.id,
          name: user.name ?? user.username,
          username: user.username,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.username = (user as any).username;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).username = token.username;
      }
      return session;
    },
  },
};
