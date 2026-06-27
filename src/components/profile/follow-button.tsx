"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { toggleFollow } from "@/lib/actions/follow";
import { Button } from "@/components/ui/button";

export function FollowButton({
  targetUserId,
  initialFollowing,
  className,
}: {
  targetUserId: string;
  initialFollowing: boolean;
  className?: string;
}) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [, startTransition] = useTransition();

  function onClick() {
    const next = !following;
    setFollowing(next);
    startTransition(async () => {
      const res = await toggleFollow(targetUserId);
      if (res.error) {
        setFollowing(!next);
        toast.error(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <Button variant={following ? "outline" : "default"} size="sm" className={className} onClick={onClick}>
      {following ? (
        <>
          <UserCheck className="h-4 w-4" /> Following
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4" /> Follow
        </>
      )}
    </Button>
  );
}
