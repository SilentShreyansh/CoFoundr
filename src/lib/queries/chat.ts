import { prisma } from "@/lib/prisma";

const userSelect = { id: true, name: true, username: true, image: true };

export async function getUserChats(userId: string) {
  const chats = await prisma.chat.findMany({
    where: { participants: { some: { userId } } },
    orderBy: { updatedAt: "desc" },
    include: {
      participants: { include: { user: { select: userSelect } } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  return Promise.all(
    chats.map(async (chat) => {
      const me = chat.participants.find((p) => p.userId === userId);
      const other = chat.participants.find((p) => p.userId !== userId);
      const unread = await prisma.message.count({
        where: {
          chatId: chat.id,
          senderId: { not: userId },
          ...(me?.lastReadAt ? { createdAt: { gt: me.lastReadAt } } : {}),
        },
      });
      return {
        id: chat.id,
        updatedAt: chat.updatedAt,
        other: other?.user ?? null,
        lastMessage: chat.messages[0] ?? null,
        unread,
      };
    }),
  );
}

export async function getChat(chatId: string, userId: string) {
  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    include: {
      participants: { include: { user: { select: userSelect } } },
      messages: {
        orderBy: { createdAt: "asc" },
        take: 100,
        include: { sender: { select: userSelect } },
      },
    },
  });
  if (!chat) return null;
  if (!chat.participants.some((p) => p.userId === userId)) return null;

  const other = chat.participants.find((p) => p.userId !== userId)?.user ?? null;
  const otherParticipant = chat.participants.find((p) => p.userId !== userId);
  return { chat, other, otherLastReadAt: otherParticipant?.lastReadAt ?? null };
}
