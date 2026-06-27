"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ShareButton({ postId, title }: { postId: string; title: string }) {
  async function share() {
    const url = `${window.location.origin}/posts/${postId}`;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // user cancelled or unsupported — fall through to clipboard
      }
    }
    await navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  }

  return (
    <Button variant="ghost" size="sm" onClick={share}>
      <Share2 className="h-4 w-4" /> Share
    </Button>
  );
}
