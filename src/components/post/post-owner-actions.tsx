"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deletePost } from "@/lib/actions/posts";
import { Button } from "@/components/ui/button";

export function PostOwnerActions({ postId }: { postId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onDelete() {
    if (!confirm("Delete this idea? This can't be undone.")) return;
    startTransition(async () => {
      const res = await deletePost(postId);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Idea deleted");
      router.push("/feed");
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Button asChild variant="outline" size="sm">
        <Link href={`/posts/${postId}/edit`}>
          <Pencil className="h-4 w-4" /> Edit
        </Link>
      </Button>
      <Button variant="outline" size="sm" disabled={pending} onClick={onDelete}>
        <Trash2 className="h-4 w-4" /> Delete
      </Button>
    </div>
  );
}
