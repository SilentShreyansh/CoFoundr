"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { notifyUser } from "@/lib/notify";
import { triggerEvent } from "@/lib/pusher/server";
import { chatChannel, ChatEvent } from "@/lib/pusher/channels";

const messageSchema = z
  .object({
    chatId: z.string().min(1),
    content: z.string().max(4000).optional(),
    imageUrl: z
      .string()
      .refine(
        (val) =>
          val === "" ||
          val.startsWith("/") ||
          val.startsWith("http://") ||
          val.startsWith("https://"),
        { message: "Must be a valid URL or local path" },
      )
      .optional(),
  })
  .refine((d) => !!d.content?.trim() || !!d.imageUrl, {
    message: "Message can't be empty",
  });

async function assertMember(chatId: string, userId: string) {
  const member = await prisma.chatParticipant.findUnique({
    where: { chatId_userId: { chatId, userId } },
  });
  return !!member;
}

export async function getOrCreateChat(otherUserId: string) {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return { error: "You must be logged in." };
  }
  if (otherUserId === userId) return { error: "You can't message yourself." };

  const other = await prisma.user.findUnique({ where: { id: otherUserId } });
  if (!other) return { error: "User not found." };

  const existing = await prisma.chat.findFirst({
    where: {
      isGroup: false,
      AND: [
        { participants: { some: { userId } } },
        { participants: { some: { userId: otherUserId } } },
      ],
    },
  });
  if (existing) return { chatId: existing.id };

  const chat = await prisma.chat.create({
    data: {
      participants: { create: [{ userId }, { userId: otherUserId }] },
    },
  });
  return { chatId: chat.id };
}

export async function sendMessage(values: unknown) {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return { error: "You must be logged in." };
  }

  const parsed = messageSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid message" };
  }
  const { chatId, content, imageUrl } = parsed.data;
  if (!(await assertMember(chatId, userId))) return { error: "Not in this chat." };

  const message = await prisma.message.create({
    data: { chatId, senderId: userId, content: content?.trim() || null, imageUrl: imageUrl || null },
    include: { sender: { select: { id: true, name: true, username: true, image: true } } },
  });

  await prisma.$transaction([
    prisma.chat.update({ where: { id: chatId }, data: { updatedAt: new Date() } }),
    prisma.chatParticipant.update({
      where: { chatId_userId: { chatId, userId } },
      data: { lastReadAt: new Date() },
    }),
  ]);

  await triggerEvent(chatChannel(chatId), ChatEvent.NewMessage, message);

  // Notify the other participant(s).
  const others = await prisma.chatParticipant.findMany({
    where: { chatId, userId: { not: userId } },
    select: { userId: true },
  });
  await Promise.all(
    others.map((o) =>
      notifyUser({
        userId: o.userId,
        actorId: userId,
        type: "MESSAGE",
        entityId: chatId,
        message: `New message from ${message.sender.name}`,
      }),
    ),
  );

  return { message };
}

export async function deleteMessage(messageId: string) {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return { error: "You must be logged in." };
  }

  const message = await prisma.message.findUnique({ where: { id: messageId } });
  if (!message) return { error: "Message not found." };
  if (message.senderId !== userId) return { error: "Not your message." };

  await prisma.message.update({
    where: { id: messageId },
    data: { deleted: true, content: null, imageUrl: null },
  });
  await triggerEvent(chatChannel(message.chatId), ChatEvent.DeleteMessage, {
    id: messageId,
  });
  return { ok: true };
}

export async function markChatRead(chatId: string) {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return { error: "You must be logged in." };
  }
  if (!(await assertMember(chatId, userId))) return { error: "Not in this chat." };

  const at = new Date();
  await prisma.chatParticipant.update({
    where: { chatId_userId: { chatId, userId } },
    data: { lastReadAt: at },
  });
  await triggerEvent(chatChannel(chatId), ChatEvent.Read, { userId, at });
  revalidatePath("/chat");
  return { ok: true };
}

export async function sendTyping(chatId: string, name: string) {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return;
  }
  await triggerEvent(chatChannel(chatId), ChatEvent.Typing, { userId, name });
}
