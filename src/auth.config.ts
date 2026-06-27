import type { NextAuthConfig } from "next-auth";
import type { UserRole } from "@prisma/client";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";

// Edge-safe config: OAuth providers + callbacks only (no Prisma / bcrypt).
// The Credentials provider and adapter are added in `auth.ts` (Node runtime).
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || undefined,
      clientSecret: process.env.AUTH_GOOGLE_SECRET || undefined,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),
    GitHub({ allowDangerousEmailAccountLinking: true }),
  ],
  callbacks: {
    // Used by the middleware to gate protected routes.
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const protectedPrefixes = [
        "/feed",
        "/dashboard",
        "/chat",
        "/notifications",
        "/saved",
        "/settings",
        "/admin",
      ];
      const isProtected = protectedPrefixes.some((p) =>
        nextUrl.pathname.startsWith(p),
      );
      if (isProtected && !isLoggedIn) return false;

      // Admin area requires the ADMIN role.
      if (nextUrl.pathname.startsWith("/admin") && auth?.user?.role !== "ADMIN") {
        return false;
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        if (user.username) token.username = user.username;
        if (user.role) token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
  },
  logger: {
    error(code, ...args) {
      console.error("[Next-Auth Error] Code:", code, "Details:", ...args);
    },
    warn(code) {
      console.warn("[Next-Auth Warning] Code:", code);
    },
  },
} satisfies NextAuthConfig;
