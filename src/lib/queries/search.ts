import { prisma } from "@/lib/prisma";

export async function searchUsers(q: string, skill?: string, take = 20) {
  if (!q && !skill) return [];
  return prisma.user.findMany({
    where: {
      banned: false,
      AND: [
        q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { username: { contains: q, mode: "insensitive" } },
                { profile: { headline: { contains: q, mode: "insensitive" } } },
              ],
            }
          : {},
        skill
          ? { skills: { some: { skill: { name: { equals: skill, mode: "insensitive" } } } } }
          : {},
      ],
    },
    take,
    select: {
      id: true,
      name: true,
      username: true,
      image: true,
      profile: { select: { headline: true, location: true } },
      skills: { include: { skill: true }, take: 5 },
    },
  });
}
