"use server";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { notifyUser } from "@/lib/notify";

export async function toggleFollow(targetUserId: string) {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return { error: "You must be logged in." };
  }
  if (targetUserId === userId) return { error: "You can't follow yourself." };

  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId: userId, followingId: targetUserId } },
  });

  if (existing) {
    await prisma.follow.delete({ where: { id: existing.id } });
    return { following: false };
  }

  await prisma.follow.create({
    data: { followerId: userId, followingId: targetUserId },
  });

  const me = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true },
  });
  await notifyUser({
    userId: targetUserId,
    actorId: userId,
    type: "FOLLOW",
    message: `${me?.name ?? "Someone"} started following you`,
  });

  return { following: true };
}
