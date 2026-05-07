import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import type { NextAuthOptions, DefaultSession } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import { customAlphabet } from "nanoid";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
    } & DefaultSession["user"];
  }
  interface User {
    username?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
  }
}

const slugId = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 6);

const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null;
      const user = await prisma.user.findUnique({
        where: { email: credentials.email.toLowerCase() },
      });
      if (!user || !user.passwordHash) return null;
      const ok = await bcrypt.compare(credentials.password, user.passwordHash);
      if (!ok) return null;
      return {
        id: user.id,
        email: user.email,
        name: user.name ?? user.username ?? undefined,
        image: user.avatarUrl ?? undefined,
        username: user.username ?? "",
      };
    },
  }),
];

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  providers.push(
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  );
}

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  );
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  events: {
    async createUser({ user }) {
      // OAuth flow: adapter just created a User row with no username.
      // Generate one before the user makes any requests.
      if (!user.email) return;
      const username = await deriveUsername(user.email);
      await prisma.user.update({
        where: { id: user.id },
        data: { username, avatarUrl: user.image ?? undefined },
      });
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = (user as { username?: string | null }).username ?? "";
      }
      // Hydrate username from DB if missing (first request after OAuth signup,
      // or if it was created before this code shipped).
      if (!token.username && (token.email || token.id)) {
        const u = await prisma.user.findFirst({
          where: token.id
            ? { id: token.id }
            : { email: String(token.email).toLowerCase() },
          select: { id: true, username: true, email: true },
        });
        if (u) {
          token.id = u.id;
          if (u.username) token.username = u.username;
          else if (u.email) {
            const username = await deriveUsername(u.email);
            await prisma.user.update({
              where: { id: u.id },
              data: { username },
            });
            token.username = username;
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.username = token.username;
      }
      return session;
    },
  },
};

async function deriveUsername(email: string): Promise<string> {
  const base =
    email
      .split("@")[0]
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "")
      .slice(0, 24) || "user";
  let candidate = base;
  for (let i = 0; i < 10; i++) {
    const exists = await prisma.user.findUnique({
      where: { username: candidate },
    });
    if (!exists) return candidate;
    candidate = `${base}-${slugId()}`;
  }
  return `user-${slugId()}`;
}

export function auth() {
  return getServerSession(authOptions);
}

export { bcrypt };
