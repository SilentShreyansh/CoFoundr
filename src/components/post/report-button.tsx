"use client";

import { useTransition } from "react";
import { Flag } from "lucide-react";
import { toast } from "sonner";
import { createReport } from "@/lib/actions/reports";
import { Button } from "@/components/ui/button";

export function ReportButton({ postId }: { postId: string }) {
  const [pending, startTransition] = useTransition();

  function report() {
    const reason = window.prompt("Why are you reporting this idea?");
    if (!reason || reason.trim().length < 5) {
      if (reason !== null) toast.error("Please add a short reason.");
      return;
    }
    startTransition(async () => {
      const res = await createReport({ targetType: "POST", targetId: postId, reason });
      if (res.error) toast.error(res.error);
      else toast.success("Reported. Thanks for keeping CoFoundr safe.");
    });
  }

  return (
    <Button variant="ghost" size="sm" disabled={pending} onClick={report}>
      <Flag className="h-4 w-4" /> Report
    </Button>
  );
}
