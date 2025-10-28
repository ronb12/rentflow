import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db, query } from "./db";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }

        try {
          // Find user in database
          const result = await query(
            "SELECT * FROM users WHERE email = ?",
            [credentials.email]
          );

          if (result.length === 0) {
            throw new Error("Invalid email or password");
          }

          const user = result[0];

          // For now, if no password hash exists, use simple comparison
          // In production, store hashed passwords
          const isValid = user.password_hash 
            ? await bcrypt.compare(credentials.password, user.password_hash)
            : user.password === credentials.password;

          if (!isValid) {
            throw new Error("Invalid email or password");
          }

          return {
            id: user.id,
            email: user.email,
            name: user.display_name || user.email,
            role: user.role || "manager",
            organizationId: user.organization_id,
          };
        } catch (error) {
          throw error;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.organizationId = user.organizationId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.organizationId = token.organizationId as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key-change-in-production",
};

