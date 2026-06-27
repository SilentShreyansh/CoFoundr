import Link from "next/link";
import { redirect } from "next/navigation";
import { MessagesSquare } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { getUserChats } from "@/lib/queries/chat";
import { initials, timeAgo } from "@/lib/labels";
import { AppShell } from "@/components/layout/app-shell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const metadata = { title: "Messages · CoFoundr" };

export default async function ChatListPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const chats = await getUserChats(user.id);

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-4 text-xl font-bold">Messages</h1>
        {chats.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
            <MessagesSquare className="h-8 w-8" />
            <p className="text-sm">
              No conversations yet. Visit a profile and hit “Message”.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
            {chats.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/chat/${c.id}`}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent"
                >
                  <Avatar>
                    {c.other?.image && (
                      <AvatarImage src={c.other.image} alt={c.other.name} />
                    )}
                    <AvatarFallback>
                      {c.other ? initials(c.other.name) : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{c.other?.name ?? "Unknown"}</span>
                      {c.lastMessage && (
                        <span className="text-xs text-muted-foreground">
                          {timeAgo(c.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    <p className="truncate text-sm text-muted-foreground">
                      {c.lastMessage?.deleted
                        ? "Message deleted"
                        : c.lastMessage?.content ??
                          (c.lastMessage?.imageUrl ? "📷 Photo" : "No messages yet")}
                    </p>
                  </div>
                  {c.unread > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground">
                      {c.unread}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
