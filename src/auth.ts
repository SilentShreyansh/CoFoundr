import NextAuth, { type DefaultSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import type { Adapter, AdapterUser } from "next-auth/adapters";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";
import { loginSchema } from "@/lib/validations/auth";
import { uniqueUsername } from "@/lib/username";

// Wrap the Prisma adapter so OAuth-created users get a username + empty profile.
function buildAdapter(): Adapter {
  const base = PrismaAdapter(prisma);
  return {
    ...base,
    createUser: async (user) => {
      const username = await uniqueUsername(user.email ?? user.name ?? "user");
      const created = await prisma.user.create({
        data: {
          name: user.name ?? user.email!.split("@")[0],
          email: user.email!,
          emailVerified: user.emailVerified ?? null,
          image: user.image ?? null,
          username,
          profile: { create: {} },
        },
      });
      return created as unknown as AdapterUser;
    },
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: buildAdapter(),
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
  providers: [
    ...authConfig.providers,
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (credentials) => {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash || user.banned) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          username: user.username,
          role: user.role,
        };
      },
    }),
  ],
});

export type { DefaultSession };
