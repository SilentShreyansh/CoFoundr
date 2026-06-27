"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Bell } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getPusherClient, realtimeEnabled } from "@/lib/pusher/client";
import { userChannel, UserEvent } from "@/lib/pusher/channels";

async function fetchCount(): Promise<number> {
  const res = await fetch("/api/notifications/count");
  if (!res.ok) return 0;
  const data = await res.json();
  return data.count ?? 0;
}

export function NavBell({ userId }: { userId: string }) {
  const queryClient = useQueryClient();
  const { data: count = 0 } = useQuery({
    queryKey: ["notif-count"],
    queryFn: fetchCount,
    // Polling fallback; shortened when realtime push isn't available.
    refetchInterval: realtimeEnabled ? false : 30_000,
    refetchOnWindowFocus: true,
  });

  // Live push: refresh the count immediately when a notification arrives.
  useEffect(() => {
    if (!realtimeEnabled) return;
    const pusher = getPusherClient();
    if (!pusher) return;
    const channel = pusher.subscribe(userChannel(userId));
    channel.bind(UserEvent.Notification, () => {
      queryClient.invalidateQueries({ queryKey: ["notif-count"] });
    });
    return () => {
      channel.unbind_all();
      pusher.unsubscribe(userChannel(userId));
    };
  }, [userId, queryClient]);

  return (
    <Link
      href="/notifications"
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background transition-colors hover:bg-accent"
      aria-label="Notifications"
    >
      <Bell className="h-4 w-4" />
      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
