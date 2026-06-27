import { auth } from "@/auth";

/** Returns the current session user, or null if not authenticated. */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

/** Returns the current user id, throwing if not authenticated. Use in mutations. */
export async function requireUserId() {
  const session = await auth();
  if (!session?.user) throw new Error("UNAUTHENTICATED");
  return session.user.id;
}
