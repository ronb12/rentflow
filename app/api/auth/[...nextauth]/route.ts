import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // For now, accept any credentials
        // Will implement database check later
        if (credentials?.email && credentials?.password) {
          return {
            id: "1",
            email: credentials.email,
            name: credentials.email,
            role: "owner",
          };
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "rentflow-secret-key-2024",
});

export { handler as GET, handler as POST };

