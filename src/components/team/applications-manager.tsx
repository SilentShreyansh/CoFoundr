"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { initials, timeAgo, TEAM_ROLE_LABELS, APPLICATION_TYPE_LABELS } from "@/lib/labels";
import { decideApplication } from "@/lib/actions/teams";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ApplicationType, TeamRole, ApplicationStatus } from "@prisma/client";

interface ApplicationItem {
  id: string;
  type: ApplicationType;
  role: TeamRole | null;
  message: string | null;
  status: ApplicationStatus;
  createdAt: string | Date;
  applicant: {
    id: string;
    name: string;
    username: string;
    image: string | null;
    profile: { headline: string | null } | null;
  };
}

const STATUS_VARIANT: Record<ApplicationStatus, "default" | "secondary" | "outline"> = {
  PENDING: "secondary",
  ACCEPTED: "default",
  REJECTED: "outline",
  WITHDRAWN: "outline",
};

export function ApplicationsManager({
  applications,
}: {
  applications: ApplicationItem[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function decide(id: string, decision: "ACCEPTED" | "REJECTED") {
    startTransition(async () => {
      const res = await decideApplication(id, decision);
      if (res.error) toast.error(res.error);
      else {
        toast.success(decision === "ACCEPTED" ? "Applicant accepted" : "Applicant declined");
        router.refresh();
      }
    });
  }

  if (applications.length === 0) {
    return <p className="text-sm text-muted-foreground">No applications yet.</p>;
  }

  return (
    <div className="space-y-3">
      {applications.map((app) => (
        <div key={app.id} className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-start gap-3">
            <Avatar>
              {app.applicant.image && (
                <AvatarImage src={app.applicant.image} alt={app.applicant.name} />
              )}
              <AvatarFallback>{initials(app.applicant.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm">
                <Link
                  href={`/u/${app.applicant.username}`}
                  className="font-medium hover:underline"
                >
                  {app.applicant.name}
                </Link>
                <span className="text-xs text-muted-foreground">
                  {timeAgo(app.createdAt)}
                </span>
              </div>
              {app.applicant.profile?.headline && (
                <p className="text-xs text-muted-foreground">
                  {app.applicant.profile.headline}
                </p>
              )}
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Badge variant="secondary">{APPLICATION_TYPE_LABELS[app.type]}</Badge>
                {app.role && <Badge variant="outline">{TEAM_ROLE_LABELS[app.role]}</Badge>}
                <Badge variant={STATUS_VARIANT[app.status]}>{app.status}</Badge>
              </div>
              {app.message && <p className="mt-2 text-sm">{app.message}</p>}
            </div>
            {app.status === "PENDING" && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  disabled={pending}
                  onClick={() => decide(app.id, "ACCEPTED")}
                >
                  <Check className="h-4 w-4" /> Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pending}
                  onClick={() => decide(app.id, "REJECTED")}
                >
                  <X className="h-4 w-4" /> Decline
                </Button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
