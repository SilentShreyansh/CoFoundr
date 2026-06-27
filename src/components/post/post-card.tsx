"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useTransition } from "react";
import { Heart, MessageCircle, Bookmark, Eye, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { initials, timeAgo, STAGE_LABELS } from "@/lib/labels";
import { toggleLike, toggleSave } from "@/lib/actions/social";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export interface PostCardData {
  id: string;
  title: string;
  description: string;
  stage: keyof typeof STAGE_LABELS;
  tags: string[];
  skillsNeeded: string[];
  viewCount: number;
  publishedAt: string | Date | null;
  createdAt: string | Date;
  author: { name: string; username: string; image: string | null };
  images: { url: string }[];
  _count: { likes: number; comments: number; savedBy: number; applications: number };
  likedByMe: boolean;
  savedByMe: boolean;
}
export function PostCard({ post }: { post: PostCardData }) {
  const [liked, setLiked] = useState(post.likedByMe);
  const [saved, setSaved] = useState(post.savedByMe);
  const [likeCount, setLikeCount] = useState(post._count.likes);
  const [, startTransition] = useTransition();
  const [expanded, setExpanded] = useState(false);
  const isLongDescription = post.description.length > 200;

  function onLike() {
    setLiked((v) => !v);
    setLikeCount((c) => c + (liked ? -1 : 1));
    startTransition(() => {
      toggleLike(post.id);
    });
  }

  function onSave() {
    setSaved((v) => !v);
    startTransition(() => {
      toggleSave(post.id);
    });
  }

  return (
    <Card className="p-4 rounded-none border-x-0 border-y sm:rounded-xl sm:border bg-card shadow-xs">
      <div className="flex items-center gap-3">
        <Avatar className="size-9">
          {post.author.image && (
            <AvatarImage src={post.author.image} alt={post.author.name} />
          )}
          <AvatarFallback>{initials(post.author.name)}</AvatarFallback>
        </Avatar>
        <div className="text-sm">
          <Link
            href={`/u/${post.author.username}`}
            className="font-medium hover:underline text-foreground"
          >
            {post.author.name}
          </Link>
          <span className="text-muted-foreground">
            {" "}
            · {timeAgo(post.publishedAt ?? post.createdAt)}
          </span>
        </div>
        <Badge variant="secondary" className="ml-auto text-xs">
          {STAGE_LABELS[post.stage]}
        </Badge>
      </div>

      <div className="mt-3 block">
        <Link href={`/posts/${post.id}`} className="hover:underline">
          <h3 className="text-lg font-semibold leading-snug text-foreground">{post.title}</h3>
        </Link>
        <p className={cn(
          "mt-1 text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed",
          !expanded && "line-clamp-3"
        )}>
          {post.description}
        </p>
        {isLongDescription && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-1 text-xs font-semibold text-primary hover:underline focus:outline-none cursor-pointer"
          >
            {expanded ? "Show less" : "Show more"}
          </button>
        )}
      </div>

      {post.images[0] && (
        <Link href={`/posts/${post.id}`} className="mt-3 block">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border">
            <Image
              src={post.images[0].url}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 640px"
            />
          </div>
        </Link>
      )}

      {(post.skillsNeeded.length > 0 || post.tags.length > 0) && (
        <div className="mt-3 space-y-3">
          {post.skillsNeeded.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-medium uppercase text-muted-foreground tracking-wider">
                Looking for
              </p>
              <div className="flex flex-wrap gap-1.5">
                {post.skillsNeeded.slice(0, 4).map((s) => (
                  <Badge
                    key={s}
                    className="bg-primary text-primary-foreground border-transparent shadow-xs font-semibold text-xs px-2 py-0.5"
                  >
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {post.tags.slice(0, 3).map((t) => (
                <Badge key={t} variant="secondary" className="text-xs px-2 py-0.5">
                  #{t}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-4 -mx-2 flex items-center justify-between border-t border-border/50 pt-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <button
            onClick={onLike}
            className={cn(
              "flex min-h-[44px] min-w-[44px] items-center gap-1.5 rounded-md px-3 py-2 transition-colors hover:bg-accent cursor-pointer",
              liked && "text-primary",
            )}
          >
            <Heart className={cn("h-4.5 w-4.5", liked && "fill-current")} />
            <span className="font-medium text-xs">{likeCount}</span>
          </button>
          <Link
            href={`/posts/${post.id}`}
            className="flex min-h-[44px] min-w-[44px] items-center gap-1.5 rounded-md px-3 py-2 transition-colors hover:bg-accent"
          >
            <MessageCircle className="h-4.5 w-4.5" />
            <span className="font-medium text-xs">{post._count.comments}</span>
          </Link>
          <button
            onClick={onSave}
            className={cn(
              "flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md p-2 transition-colors hover:bg-accent cursor-pointer",
              saved && "text-primary",
            )}
            aria-label="Save idea"
          >
            <Bookmark className={cn("h-4.5 w-4.5", saved && "fill-current")} />
          </button>
        </div>
        <div className="flex items-center gap-3 text-xs pr-2 select-none">
          <span className="flex items-center gap-1" title="Applications">
            <Users className="h-4 w-4" />
            {post._count.applications}
          </span>
          <span className="flex items-center gap-1" title="Views">
            <Eye className="h-4 w-4" />
            {post.viewCount}
          </span>
        </div>
      </div>
    </Card>
  );
}
