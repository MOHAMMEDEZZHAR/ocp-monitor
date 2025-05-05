import type { NextAuthOptions, User, Session, DefaultSession } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";

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

          // Récupérer l'utilisateur sans vérifier le mot de passe
          const [rows]: any = await conn.execute(
            'SELECT * FROM users WHERE username = ?',
            [credentials.username]
          );

          await conn.end();

          const user = rows[0];
          if (!user) {
            console.log('User not found');
            return null;
          }

          if (!user.is_active) {
            console.log('User account is inactive');
            return null;
          }

          // Vérification du mot de passe avec bcrypt
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          if (!isPasswordValid) {
            console.log('Invalid password');
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
        // Ajouter un timestamp pour l'expiration de session
        token.lastActive = Date.now();
      } else {
        // Vérifier si la session a expiré (30 minutes d'inactivité)
        const lastActive = token.lastActive as number || 0;
        const sessionTimeout = 30 * 60 * 1000; // 30 minutes en millisecondes
        
        if (Date.now() - lastActive > sessionTimeout) {
          // Session expirée
          token.error = "SessionExpired";
        } else {
          // Mettre à jour le timestamp d'activité
          token.lastActive = Date.now();
        }
      }
      return token;
    },
    async session({ session, token }): Promise<Session | DefaultSession> {
      if (session?.user) {
        (session.user as any).role = token.role;
        
        // Si la session a expiré, on renvoie la session mais avec un indicateur d'expiration
        if (token.error === "SessionExpired") {
          (session as any).expired = true;
        }
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 heures (durée maximale de la session)
  },
  secret: process.env.NEXTAUTH_SECRET,
};
