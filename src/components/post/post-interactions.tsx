"use client";

import { useState, useTransition } from "react";
import { Heart, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleLike, toggleSave } from "@/lib/actions/social";
import { Button } from "@/components/ui/button";

export function PostInteractions({
  postId,
  initialLiked,
  initialSaved,
  initialLikes,
}: {
  postId: string;
  initialLiked: boolean;
  initialSaved: boolean;
  initialLikes: number;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [saved, setSaved] = useState(initialSaved);
  const [likes, setLikes] = useState(initialLikes);
  const [, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={liked ? "default" : "outline"}
        size="sm"
        onClick={() => {
          setLiked((v) => !v);
          setLikes((c) => c + (liked ? -1 : 1));
          startTransition(() => {
            toggleLike(postId);
          });
        }}
      >
        <Heart className={cn("h-4 w-4", liked && "fill-current")} /> {likes}
      </Button>
      <Button
        variant={saved ? "default" : "outline"}
        size="sm"
        onClick={() => {
          setSaved((v) => !v);
          startTransition(() => {
            toggleSave(postId);
          });
        }}
      >
        <Bookmark className={cn("h-4 w-4", saved && "fill-current")} />
        {saved ? "Saved" : "Save"}
      </Button>
    </div>
  );
}
