"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { toast } from "sonner";
import { initials, TEAM_ROLE_LABELS } from "@/lib/labels";
import { removeTeamMember } from "@/lib/actions/teams";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { TeamRole } from "@prisma/client";

interface Member {
  id: string;
  role: TeamRole;
  user: { id: string; name: string; username: string; image: string | null };
}

export function TeamMembers({
  postId,
  members,
  isOwner,
}: {
  postId: string;
  members: Member[];
  isOwner: boolean;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  if (members.length === 0) return null;

  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">Team</p>
      <div className="flex flex-wrap gap-2">
        {members.map((m) => (
          <div
            key={m.id}
            className="flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-3"
          >
            <Avatar className="size-6">
              {m.user.image && <AvatarImage src={m.user.image} alt={m.user.name} />}
              <AvatarFallback className="text-[10px]">
                {initials(m.user.name)}
              </AvatarFallback>
            </Avatar>
            <Link href={`/u/${m.user.username}`} className="text-sm hover:underline">
              {m.user.name}
            </Link>
            <Badge variant="secondary">{TEAM_ROLE_LABELS[m.role]}</Badge>
            {isOwner && (
              <button
                onClick={() =>
                  startTransition(async () => {
                    const res = await removeTeamMember(postId, m.user.id);
                    if (res.error) toast.error(res.error);
                    else router.refresh();
                  })
                }
                className="text-muted-foreground hover:text-destructive"
                aria-label="Remove member"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
