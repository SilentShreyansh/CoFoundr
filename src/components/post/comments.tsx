"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { initials, timeAgo } from "@/lib/labels";
import { addComment, deleteComment } from "@/lib/actions/social";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface CommentAuthor {
  id: string;
  name: string;
  username: string;
  image: string | null;
}
export interface CommentData {
  id: string;
  content: string;
  createdAt: string | Date;
  author: CommentAuthor;
  replies?: CommentData[];
}

export function Comments({
  postId,
  currentUserId,
  comments,
}: {
  postId: string;
  currentUserId: string | null;
  comments: CommentData[];
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">
        Comments ({comments.reduce((n, c) => n + 1 + (c.replies?.length ?? 0), 0)})
      </h2>

      {currentUserId ? (
        <CommentForm postId={postId} />
      ) : (
        <p className="text-sm text-muted-foreground">
          <Link href="/login" className="text-primary hover:underline">
            Log in
          </Link>{" "}
          to join the discussion.
        </p>
      )}

      <div className="space-y-5">
        {comments.map((c) => (
          <CommentItem
            key={c.id}
            comment={c}
            postId={postId}
            currentUserId={currentUserId}
          />
        ))}
        {comments.length === 0 && (
          <p className="text-sm text-muted-foreground">No comments yet.</p>
        )}
      </div>
    </div>
  );
}

function CommentForm({
  postId,
  parentId,
  onDone,
}: {
  postId: string;
  parentId?: string;
  onDone?: () => void;
}) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [pending, startTransition] = useTransition();

  function submit() {
    if (!content.trim()) return;
    startTransition(async () => {
      const res = await addComment({ postId, parentId, content });
      if (res.error) {
        toast.error(res.error);
        return;
      }
      setContent("");
      onDone?.();
      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={parentId ? "Write a reply…" : "Add a comment…"}
        rows={parentId ? 2 : 3}
      />
      <div className="flex justify-end">
        <Button size="sm" disabled={pending || !content.trim()} onClick={submit}>
          {pending ? "Posting…" : parentId ? "Reply" : "Comment"}
        </Button>
      </div>
    </div>
  );
}

function CommentItem({
  comment,
  postId,
  currentUserId,
}: {
  comment: CommentData;
  postId: string;
  currentUserId: string | null;
}) {
  const router = useRouter();
  const [replying, setReplying] = useState(false);
  const [, startTransition] = useTransition();

  function remove() {
    startTransition(async () => {
      const res = await deleteComment(comment.id);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <Avatar className="size-8">
          {comment.author.image && (
            <AvatarImage src={comment.author.image} alt={comment.author.name} />
          )}
          <AvatarFallback>{initials(comment.author.name)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm">
            <Link
              href={`/u/${comment.author.username}`}
              className="font-medium hover:underline"
            >
              {comment.author.name}
            </Link>
            <span className="text-xs text-muted-foreground">
              {timeAgo(comment.createdAt)}
            </span>
          </div>
          <p className="mt-1 text-sm">{comment.content}</p>
          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
            {currentUserId && (
              <button
                onClick={() => setReplying((v) => !v)}
                className="hover:text-foreground"
              >
                Reply
              </button>
            )}
            {currentUserId === comment.author.id && (
              <button
                onClick={remove}
                className="flex items-center gap-1 hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" /> Delete
              </button>
            )}
          </div>

          {replying && (
            <div className="mt-3">
              <CommentForm
                postId={postId}
                parentId={comment.id}
                onDone={() => setReplying(false)}
              />
            </div>
          )}
        </div>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-11 space-y-3 border-l border-border pl-4">
          {comment.replies.map((r) => (
            <CommentItem
              key={r.id}
              comment={r}
              postId={postId}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
