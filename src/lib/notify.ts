import { prisma } from "@/lib/prisma";
import { triggerEvent } from "@/lib/pusher/server";
import { userChannel, UserEvent } from "@/lib/pusher/channels";
import type { NotificationType } from "@prisma/client";

interface NotifyInput {
  userId: string;
  actorId?: string;
  type: NotificationType;
  entityId?: string;
  message: string;
}

// Create a notification row and push a realtime ping to the recipient
// (no-ops on the push when Pusher isn't configured — the bell still polls).
export async function notifyUser(input: NotifyInput) {
  const notification = await prisma.notification.create({
    data: {
      userId: input.userId,
      actorId: input.actorId ?? null,
      type: input.type,
      entityId: input.entityId ?? null,
      message: input.message,
    },
  });
  await triggerEvent(userChannel(input.userId), UserEvent.Notification, {
    id: notification.id,
  });
  return notification;
}
