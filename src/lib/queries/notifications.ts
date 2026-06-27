import { prisma } from "@/lib/prisma";

export async function getNotifications(userId: string, take = 30) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take,
    include: {
      actor: { select: { id: true, name: true, username: true, image: true } },
    },
  });
}

export async function getUnreadCount(userId: string) {
  return prisma.notification.count({ where: { userId, read: false } });
}
