import type { NextAuthConfig } from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';

export const authConfig: NextAuthConfig = {
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID ?? 'demo',
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? 'demo',
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? 'demo',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? 'demo',
    }),
  ],
  trustHost: true,
  pages: {
    signIn: '/',
  },
};
