import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { pusherServer } from "@/lib/pusher/server";

// Presence-channel auth: confirms the user is a participant of the chat.
export async function POST(request: Request) {
  if (!pusherServer) {
    return NextResponse.json({ error: "Realtime disabled" }, { status: 503 });
  }
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.text();
  const params = new URLSearchParams(body);
  const socketId = params.get("socket_id");
  const channel = params.get("channel_name");
  if (!socketId || !channel) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  // Private per-user channel for notifications: only the owner may subscribe.
  if (channel.startsWith("private-user-")) {
    if (channel !== `private-user-${user.id}`) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json(pusherServer.authorizeChannel(socketId, channel));
  }

  // Presence chat channel: caller must be a participant.
  const chatId = channel.replace("presence-chat-", "");
  const membership = await prisma.chatParticipant.findUnique({
    where: { chatId_userId: { chatId, userId: user.id } },
  });
  if (!membership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const auth = pusherServer.authorizeChannel(socketId, channel, {
    user_id: user.id,
    user_info: { name: user.name, username: user.username, image: user.image },
  });
  return NextResponse.json(auth);
}
