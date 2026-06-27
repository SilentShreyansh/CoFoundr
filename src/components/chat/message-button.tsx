"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { getOrCreateChat } from "@/lib/actions/chat";
import { Button } from "@/components/ui/button";

export function MessageButton({ userId, className }: { userId: string; className?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      size="sm"
      className={className}
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await getOrCreateChat(userId);
          if (res.error || !res.chatId) {
            toast.error(res.error ?? "Couldn't start chat");
            return;
          }
          router.push(`/chat/${res.chatId}`);
        })
      }
    >
      <MessageSquare className="h-4 w-4" /> Message
    </Button>
  );
}
