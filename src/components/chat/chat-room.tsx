"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ImagePlus, Send, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { initials, timeAgo } from "@/lib/labels";
import {
  sendMessage,
  deleteMessage,
  markChatRead,
  sendTyping,
} from "@/lib/actions/chat";
import { getPusherClient, realtimeEnabled } from "@/lib/pusher/client";
import { chatChannel, ChatEvent } from "@/lib/pusher/channels";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { compressImage } from "@/lib/image-compress";

interface ChatUser {
  id: string;
  name: string;
  username: string;
  image: string | null;
}
export interface ChatMessage {
  id: string;
  senderId: string;
  content: string | null;
  imageUrl: string | null;
  deleted: boolean;
  createdAt: string | Date;
  sender: ChatUser;
}

export function ChatRoom({
  chatId,
  currentUserId,
  other,
  initialMessages,
  initialOtherReadAt,
}: {
  chatId: string;
  currentUserId: string;
  other: ChatUser | null;
  initialMessages: ChatMessage[];
  initialOtherReadAt: string | Date | null;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [otherReadAt, setOtherReadAt] = useState<Date | null>(
    initialOtherReadAt ? new Date(initialOtherReadAt) : null,
  );
  const [online, setOnline] = useState(false);
  const [typing, setTyping] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Mark read on mount and whenever messages change.
  useEffect(() => {
    markChatRead(chatId);
  }, [chatId, messages.length]);

  useEffect(scrollToBottom, [messages, scrollToBottom]);

  // Realtime via Pusher presence channel, or polling fallback.
  useEffect(() => {
    if (realtimeEnabled) {
      const pusher = getPusherClient();
      if (!pusher) return;
      const channel = pusher.subscribe(chatChannel(chatId));

      const upsert = (m: ChatMessage) =>
        setMessages((prev) =>
          prev.some((x) => x.id === m.id) ? prev : [...prev, m],
        );

      channel.bind(ChatEvent.NewMessage, upsert);
      channel.bind(ChatEvent.DeleteMessage, ({ id }: { id: string }) =>
        setMessages((prev) =>
          prev.map((m) =>
            m.id === id ? { ...m, deleted: true, content: null, imageUrl: null } : m,
          ),
        ),
      );
      channel.bind(ChatEvent.Read, ({ userId, at }: { userId: string; at: string }) => {
        if (userId !== currentUserId) setOtherReadAt(new Date(at));
      });
      channel.bind(ChatEvent.Typing, ({ userId }: { userId: string }) => {
        if (userId === currentUserId) return;
        setTyping(true);
        if (typingTimeout.current) clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => setTyping(false), 2500);
      });

      // Presence → online status.
      type Members = { each: (cb: (m: { id: string }) => void) => void };
      channel.bind("pusher:subscription_succeeded", (members: Members) => {
        let count = 0;
        members.each((m) => {
          if (m.id !== currentUserId) count++;
        });
        setOnline(count > 0);
      });
      channel.bind("pusher:member_added", (m: { id: string }) => {
        if (m.id !== currentUserId) setOnline(true);
      });
      channel.bind("pusher:member_removed", (m: { id: string }) => {
        if (m.id !== currentUserId) setOnline(false);
      });

      return () => {
        channel.unbind_all();
        pusher.unsubscribe(chatChannel(chatId));
      };
    }

    // Polling fallback.
    const interval = setInterval(async () => {
      const res = await fetch(`/api/chat/${chatId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [chatId, currentUserId]);

  function onType(value: string) {
    setDraft(value);
    if (realtimeEnabled) sendTyping(chatId, "");
  }

  async function handleSend(imageUrl?: string) {
    const content = draft.trim();
    if (!content && !imageUrl) return;
    setSending(true);
    const res = await sendMessage({ chatId, content: content || undefined, imageUrl });
    setSending(false);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    const msg = res.message;
    if (msg) {
      setMessages((prev) =>
        prev.some((m) => m.id === msg.id) ? prev : [...prev, msg],
      );
    }
    setDraft("");
  }

  async function handleImage(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    let fileToUpload = file;
    try {
      fileToUpload = await compressImage(file);
    } catch (e) {
      console.error("Compression failed, uploading original file", e);
    }
    const form = new FormData();
    form.append("file", fileToUpload);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    setUploading(false);
    if (!res.ok) {
      toast.error("Upload failed");
      return;
    }
    const { url } = await res.json();
    await handleSend(url);
  }

  const lastMine = [...messages].reverse().find((m) => m.senderId === currentUserId);
  const seen =
    lastMine && otherReadAt && otherReadAt >= new Date(lastMine.createdAt);

  return (
    <div className="flex h-[100dvh] sm:h-[calc(100vh-7rem)] flex-col rounded-none sm:rounded-xl border-none sm:border bg-background overflow-hidden">
      <div className="flex items-center gap-3 border-b border-border p-3 sticky top-0 z-30 bg-background/95 backdrop-blur-md shrink-0">
        <Link
          href="/chat"
          className="mr-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-foreground hover:bg-accent sm:hidden cursor-pointer"
          aria-label="Back to messages"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        {other && (
          <>
            <div className="relative shrink-0">
              <Avatar className="size-9 sm:size-10">
                {other.image && <AvatarImage src={other.image} alt={other.name} />}
                <AvatarFallback>{initials(other.name)}</AvatarFallback>
              </Avatar>
              {online && (
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background bg-green-500" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <Link href={`/u/${other.username}`} className="font-semibold text-sm sm:text-base hover:underline block truncate text-foreground">
                {other.name}
              </Link>
              <p className="text-xs text-muted-foreground truncate leading-none mt-0.5">
                {typing ? "typing…" : online ? "online" : `@${other.username}`}
              </p>
            </div>
          </>
        )}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4 smooth-scroll">
        {messages.map((m) => {
          const mine = m.senderId === currentUserId;
          return (
            <div
              key={m.id}
              className={cn("flex gap-2 max-w-full", mine ? "justify-end" : "justify-start")}
            >
              {!mine && (
                <Avatar className="size-8 shrink-0">
                  {m.sender.image && <AvatarImage src={m.sender.image} alt={m.sender.name} />}
                  <AvatarFallback className="text-[10px]">
                    {initials(m.sender.name)}
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  "group max-w-[78%] sm:max-w-[70%] rounded-2xl px-3.5 py-2 text-sm break-words",
                  mine
                    ? "bg-primary text-primary-foreground rounded-tr-none"
                    : "bg-muted text-foreground rounded-tl-none",
                )}
              >
                {m.deleted ? (
                  <span className="italic opacity-70">Message deleted</span>
                ) : (
                  <>
                    {m.imageUrl && (
                      <div className="relative mb-1.5 aspect-video w-64 max-w-full overflow-hidden rounded-lg border border-border/10">
                        <Image src={m.imageUrl} alt="" fill className="object-cover" sizes="256px" />
                      </div>
                    )}
                    {m.content && <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>}
                  </>
                )}
                <div className="mt-1 flex items-center justify-end gap-1.5 leading-none">
                  <span className="text-[9px] opacity-60 font-mono select-none">{timeAgo(m.createdAt)}</span>
                  {mine && !m.deleted && (
                    <button
                      onClick={() => deleteMessage(m.id)}
                      className="opacity-0 transition-opacity group-hover:opacity-75 hover:!opacity-100 cursor-pointer"
                      aria-label="Delete message"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {seen && (
          <p className="text-right text-[10px] text-muted-foreground mr-1">Seen</p>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-center gap-2 border-t border-border bg-background p-3 pb-safe shrink-0">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => handleImage(e.target.files?.[0])}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
        </Button>
        <Input
          value={draft}
          onChange={(e) => onType(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Type a message…"
        />
        <Button
          type="button"
          size="icon"
          disabled={sending || (!draft.trim() && !uploading)}
          onClick={() => handleSend()}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
