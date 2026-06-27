import Pusher from "pusher";

// Server Pusher instance — only created when fully configured.
export const pusherServer =
  process.env.PUSHER_APP_ID &&
  process.env.NEXT_PUBLIC_PUSHER_KEY &&
  process.env.PUSHER_SECRET
    ? new Pusher({
        appId: process.env.PUSHER_APP_ID,
        key: process.env.NEXT_PUBLIC_PUSHER_KEY,
        secret: process.env.PUSHER_SECRET,
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? "mt1",
        useTLS: true,
      })
    : null;

export const isRealtimeEnabled = pusherServer !== null;

// Fire-and-forget trigger that no-ops when Pusher isn't configured.
export async function triggerEvent(channel: string, event: string, data: unknown) {
  if (!pusherServer) return;
  try {
    await pusherServer.trigger(channel, event, data);
  } catch (err) {
    console.error("Pusher trigger failed:", err);
  }
}
