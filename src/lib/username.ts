import { prisma } from "@/lib/prisma";

// Generate a unique username from an email/name seed.
export async function uniqueUsername(seed: string) {
  const base =
    seed
      .split("@")[0]
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "")
      .slice(0, 20) || "user";
  let candidate = base;
  let n = 0;
  while (await prisma.user.findUnique({ where: { username: candidate } })) {
    n += 1;
    candidate = `${base}${n}`;
  }
  return candidate;
}
