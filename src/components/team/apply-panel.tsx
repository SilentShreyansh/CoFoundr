"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  applicationSchema,
  type ApplicationInput,
  APPLICATION_TYPES,
  TEAM_ROLES,
} from "@/lib/validations/application";
import { APPLICATION_TYPE_LABELS, TEAM_ROLE_LABELS } from "@/lib/labels";
import { applyToPost, withdrawApplication } from "@/lib/actions/teams";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

interface ExistingApplication {
  id: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";
  type: (typeof APPLICATION_TYPES)[number];
}

export function ApplyPanel({
  postId,
  isMember,
  application,
}: {
  postId: string;
  isMember: boolean;
  application: ExistingApplication | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const { register, handleSubmit } = useForm<ApplicationInput>({
    resolver: zodResolver(applicationSchema),
    defaultValues: { postId, type: "COFOUNDER", role: "DEVELOPER", message: "" },
  });

  if (isMember) {
    return (
      <div className="rounded-lg border border-border bg-card p-4 text-sm">
        ✅ You&apos;re part of this team.
      </div>
    );
  }

  if (application && application.status === "PENDING") {
    return (
      <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4 text-sm">
        <span>
          Application sent ·{" "}
          <Badge variant="secondary">{APPLICATION_TYPE_LABELS[application.type]}</Badge>{" "}
          pending review
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            const res = await withdrawApplication(application.id);
            if (res.error) toast.error(res.error);
            else {
              toast.success("Application withdrawn");
              router.refresh();
            }
          }}
        >
          Withdraw
        </Button>
      </div>
    );
  }

  if (application && application.status === "ACCEPTED") {
    return (
      <div className="rounded-lg border border-border bg-card p-4 text-sm">
        🎉 You were accepted to this team.
      </div>
    );
  }

  async function onSubmit(values: ApplicationInput) {
    setPending(true);
    const res = await applyToPost(values);
    setPending(false);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    toast.success("Application sent!");
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        {application?.status === "REJECTED" ? "Apply again" : "Apply to join"}
      </Button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 rounded-lg border border-border bg-card p-4"
    >
      <input type="hidden" {...register("postId")} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="type">Applying as</Label>
          <select id="type" className={selectClass} {...register("type")}>
            {APPLICATION_TYPES.map((t) => (
              <option key={t} value={t} className="bg-background text-foreground">
                {APPLICATION_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Function</Label>
          <select id="role" className={selectClass} {...register("role")}>
            {TEAM_ROLES.map((r) => (
              <option key={r} value={r} className="bg-background text-foreground">
                {TEAM_ROLE_LABELS[r]}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Message (optional)</Label>
        <Textarea
          id="message"
          rows={3}
          placeholder="Why are you a great fit?"
          {...register("message")}
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Sending…" : "Send application"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
