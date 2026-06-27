import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import {
  getAdminStats,
  listUsers,
  listPosts,
  listReports,
} from "@/lib/queries/admin";
import { AppShell } from "@/components/layout/app-shell";
import {
  UsersTable,
  PostsTable,
  ReportsTable,
} from "@/components/admin/admin-tables";

export const metadata = { title: "Admin · CoFoundr" };

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/feed");

  const [stats, users, posts, reports] = await Promise.all([
    getAdminStats(),
    listUsers(),
    listPosts(),
    listReports(),
  ]);

  const cards = [
    { label: "Users", value: stats.users },
    { label: "Ideas", value: stats.posts },
    { label: "Comments", value: stats.comments },
    { label: "Applications", value: stats.applications },
    { label: "Open reports", value: stats.openReports },
  ];

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-8">
        <h1 className="text-xl font-bold">Admin dashboard</h1>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {cards.map((c) => (
            <div key={c.label} className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground">{c.label}</p>
              <p className="mt-1 text-2xl font-bold">{c.value}</p>
            </div>
          ))}
        </div>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase text-muted-foreground">
            Reports
          </h2>
          <ReportsTable reports={reports} />
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase text-muted-foreground">
            Users
          </h2>
          <UsersTable users={users} />
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase text-muted-foreground">
            Posts
          </h2>
          <PostsTable posts={posts} />
        </section>
      </div>
    </AppShell>
  );
}
