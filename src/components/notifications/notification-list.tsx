"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Heart,
  MessageCircle,
  Reply,
  Bookmark,
  UserPlus,
  CheckCircle2,
  XCircle,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { initials, timeAgo } from "@/lib/labels";
import {
  markNotificationRead,
  markAllNotificationsRead,
} from "@/lib/actions/notifications";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { NotificationType } from "@prisma/client";

interface NotificationItem {
  id: string;
  type: NotificationType;
  entityId: string | null;
  message: string;
  read: boolean;
  createdAt: string | Date;
  actor: { id: string; name: string; username: string; image: string | null } | null;
}

const ICONS: Record<NotificationType, typeof Heart> = {
  LIKE: Heart,
  COMMENT: MessageCircle,
  REPLY: Reply,
  SAVE: Bookmark,
  JOIN_REQUEST: UserPlus,
  REQUEST_ACCEPTED: CheckCircle2,
  REQUEST_REJECTED: XCircle,
  FOLLOW: UserPlus,
  MESSAGE: MessageCircle,
};

function linkFor(n: NotificationItem): string {
  if (!n.entityId) return "/notifications";
  if (n.type === "MESSAGE") return `/chat/${n.entityId}`;
  if (n.type === "FOLLOW" && n.actor) return `/u/${n.actor.username}`;
  return `/posts/${n.entityId}`;
}

export function NotificationList({ items }: { items: NotificationItem[] }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [, startTransition] = useTransition();

  function open(n: NotificationItem) {
    startTransition(async () => {
      if (!n.read) {
        await markNotificationRead(n.id);
        queryClient.invalidateQueries({ queryKey: ["notif-count"] });
      }
      router.push(linkFor(n));
    });
  }

  function markAll() {
    startTransition(async () => {
      await markAllNotificationsRead();
      queryClient.invalidateQueries({ queryKey: ["notif-count"] });
      router.refresh();
    });
  }

  const hasUnread = items.some((n) => !n.read);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Notifications</h1>
        {hasUnread && (
          <Button variant="outline" size="sm" onClick={markAll} className="cursor-pointer font-medium">
            Mark all read
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
          <Bell className="h-8 w-8 animate-pulse" />
          <p className="text-sm">No notifications yet.</p>
        </div>
      ) : (
        <ul className="space-y-2.5 -mx-4 sm:mx-0">
          {items.map((n) => {
            const Icon = ICONS[n.type];
            return (
              <li key={n.id} className="relative overflow-hidden rounded-none border-y sm:rounded-xl sm:border border-border bg-card">
                {/* Swipe Underlay representing Mark as Read */}
                {!n.read && (
                  <div className="absolute inset-y-0 right-0 flex w-20 items-center justify-center bg-primary text-primary-foreground font-semibold text-xs select-none">
                    <CheckCircle2 className="h-5 w-5 shrink-0" />
                  </div>
                )}
                
                {/* Swipeable Foreground Item */}
                <motion.div
                  drag={!n.read ? "x" : false}
                  dragConstraints={{ left: -80, right: 0 }}
                  dragElastic={0.15}
                  onDragEnd={async (_, info) => {
                    if (info.offset.x <= -60 && !n.read) {
                      await markNotificationRead(n.id);
                      queryClient.invalidateQueries({ queryKey: ["notif-count"] });
                      router.refresh();
                      toast.success("Notification marked as read");
                    }
                  }}
                  className={cn(
                    "flex w-full items-start gap-3 bg-card px-4 py-3.5 text-left transition-colors hover:bg-accent cursor-pointer select-none touch-pan-y",
                    !n.read && "bg-primary/[0.03] border-l-4 border-l-primary",
                  )}
                >
                  <div 
                    onClick={() => open(n)}
                    className="flex-1 flex items-start gap-3 text-left w-full"
                  >
                    {n.actor ? (
                      <Avatar className="size-9 shrink-0">
                        {n.actor.image && (
                          <AvatarImage src={n.actor.image} alt={n.actor.name} />
                        )}
                        <AvatarFallback>{initials(n.actor.name)}</AvatarFallback>
                      </Avatar>
                    ) : (
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
                        <Icon className="h-4.5 w-4.5" />
                      </span>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground leading-snug font-medium">{n.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>
                  </div>
                  {!n.read && (
                    <span className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  )}
                </motion.div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
