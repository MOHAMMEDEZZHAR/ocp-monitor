import type { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.username || !credentials?.password) {
            console.log('Missing credentials');
            return null;
          }

          const { getConnection } = await import('@/lib/db');
          const conn = await getConnection();

          const [rows]: any = await conn.execute(
            'SELECT * FROM users WHERE username = ? AND password = ?',
            [credentials.username, credentials.password]
          );

          await conn.end();

          const user = rows[0];
          if (!user) {
            console.log('User not found or invalid password');
            return null;
          }

          if (!user.is_active) {
            console.log('User account is inactive');
            return null;
          }

          return {
            id: user.id.toString(),
            name: user.username,
            email: user.email,
            role: user.role
          } as User;
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        (session.user as any).role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
