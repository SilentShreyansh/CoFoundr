"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { timeAgo } from "@/lib/labels";
import { setUserBanned, adminDeletePost, resolveReport } from "@/lib/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  UserRole,
  PostStatus,
  ReportStatus,
  ReportTargetType,
} from "@prisma/client";

interface AdminUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  banned: boolean;
  _count: { posts: number };
}
interface AdminPost {
  id: string;
  title: string;
  status: PostStatus;
  createdAt: string | Date;
  author: { name: string; username: string };
}
interface AdminReport {
  id: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  status: ReportStatus;
  createdAt: string | Date;
  reporter: { name: string; username: string };
}

export function UsersTable({ users }: { users: AdminUser[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function toggleBan(u: AdminUser) {
    startTransition(async () => {
      const res = await setUserBanned(u.id, !u.banned);
      if (res.error) toast.error(res.error);
      else {
        toast.success(u.banned ? "User unbanned" : "User banned");
        router.refresh();
      }
    });
  }

  return (
    <>
      {/* Mobile view */}
      <div className="space-y-3 md:hidden">
        {users.map((u) => (
          <div key={u.id} className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <Link href={`/u/${u.username}`} className="font-semibold text-sm hover:underline text-foreground block">
                  {u.name}
                </Link>
                <p className="text-xs text-muted-foreground">{u.email}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <Badge variant={u.role === "ADMIN" ? "default" : "secondary"} className="text-xs">
                  {u.role}
                </Badge>
                {u.banned && (
                  <Badge variant="outline" className="text-xs text-destructive border-destructive">
                    banned
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-border/50 pt-3">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Posts: {u._count.posts}</span>
              {u.role !== "ADMIN" && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pending}
                  onClick={() => toggleBan(u)}
                  className="min-h-[36px] px-3.5 font-semibold text-xs cursor-pointer"
                >
                  {u.banned ? "Unban" : "Ban"}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop view */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-medium">User</th>
              <th className="px-2 py-2 font-medium">Posts</th>
              <th className="px-2 py-2 font-medium">Role</th>
              <th className="px-2 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-2">
                  <Link href={`/u/${u.username}`} className="font-medium hover:underline">
                    {u.name}
                  </Link>
                  <span className="ml-1 text-xs text-muted-foreground">{u.email}</span>
                  {u.banned && (
                    <Badge variant="outline" className="ml-2 text-destructive">
                      banned
                    </Badge>
                  )}
                </td>
                <td className="px-2 py-2">{u._count.posts}</td>
                <td className="px-2 py-2">
                  <Badge variant={u.role === "ADMIN" ? "default" : "secondary"}>
                    {u.role}
                  </Badge>
                </td>
                <td className="px-2 py-2 text-right">
                  {u.role !== "ADMIN" && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={pending}
                      onClick={() => toggleBan(u)}
                    >
                      {u.banned ? "Unban" : "Ban"}
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function PostsTable({ posts }: { posts: AdminPost[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function remove(id: string) {
    if (!confirm("Delete this post?")) return;
    startTransition(async () => {
      const res = await adminDeletePost(id);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Post deleted");
        router.refresh();
      }
    });
  }

  return (
    <>
      {/* Mobile view */}
      <div className="space-y-3 md:hidden">
        {posts.map((p) => (
          <div key={p.id} className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-xs">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <Link href={`/posts/${p.id}`} className="font-semibold text-sm hover:underline text-foreground block truncate">
                  {p.title}
                </Link>
                <p className="text-xs text-muted-foreground mt-1">Author: @{p.author.username}</p>
                <p className="text-[10px] text-muted-foreground/80 mt-0.5">Created: {timeAgo(p.createdAt)}</p>
              </div>
              <Badge variant="secondary" className="text-xs shrink-0">{p.status}</Badge>
            </div>
            <div className="flex justify-end pt-2.5 border-t border-border/50">
              <Button
                size="sm"
                variant="outline"
                className="text-destructive hover:bg-destructive/10 min-h-[36px] px-3.5 font-semibold text-xs cursor-pointer border-destructive/30"
                disabled={pending}
                onClick={() => remove(p.id)}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop view */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-medium">Idea</th>
              <th className="px-2 py-2 font-medium">Author</th>
              <th className="px-2 py-2 font-medium">Status</th>
              <th className="px-2 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {posts.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-2">
                  <Link href={`/posts/${p.id}`} className="font-medium hover:underline">
                    {p.title}
                  </Link>
                </td>
                <td className="px-2 py-2 text-muted-foreground">@{p.author.username}</td>
                <td className="px-2 py-2">
                  <Badge variant="secondary">{p.status}</Badge>
                </td>
                <td className="px-2 py-2 text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={pending}
                    onClick={() => remove(p.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function ReportsTable({ reports }: { reports: AdminReport[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function decide(id: string, status: "RESOLVED" | "DISMISSED") {
    startTransition(async () => {
      const res = await resolveReport(id, status);
      if (res.error) toast.error(res.error);
      else {
        toast.success(`Report ${status.toLowerCase()}`);
        router.refresh();
      }
    });
  }

  if (reports.length === 0) {
    return <p className="text-sm text-muted-foreground">No reports.</p>;
  }

  return (
    <div className="space-y-3">
      {reports.map((r) => (
        <div key={r.id} className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{r.targetType}</Badge>
                <Badge
                  variant={r.status === "OPEN" ? "secondary" : "outline"}
                >
                  {r.status}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {timeAgo(r.createdAt)}
                </span>
              </div>
              <p className="mt-2 text-sm">{r.reason}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Reported by @{r.reporter.username} · target {r.targetId}
              </p>
            </div>
            {r.status === "OPEN" && (
              <div className="flex shrink-0 gap-2">
                <Button
                  size="sm"
                  disabled={pending}
                  onClick={() => decide(r.id, "RESOLVED")}
                >
                  Resolve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pending}
                  onClick={() => decide(r.id, "DISMISSED")}
                >
                  Dismiss
                </Button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
