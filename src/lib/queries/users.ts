import { prisma } from "@/lib/prisma";

export async function getProfileByUsername(username: string) {
  return prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      name: true,
      username: true,
      image: true,
      createdAt: true,
      profile: true,
      skills: { include: { skill: true } },
      _count: { select: { posts: true, followers: true, following: true } },
    },
  });
}

export async function getEditableProfile(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      image: true,
      profile: true,
      skills: { include: { skill: true } },
    },
  });
}
