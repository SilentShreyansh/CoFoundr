import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { getPostApplications } from "@/lib/queries/teams";
import { AppShell } from "@/components/layout/app-shell";
import { ApplicationsManager } from "@/components/team/applications-manager";

export const metadata = { title: "Applications · CoFoundr" };

export default async function ApplicationsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const post = await prisma.post.findUnique({
    where: { id },
    select: { authorId: true, title: true },
  });
  if (!post) notFound();
  if (post.authorId !== user.id) redirect(`/posts/${id}`);

  const applications = await getPostApplications(id);

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-5">
        <Link
          href={`/posts/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to idea
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Applications</h1>
          <p className="text-sm text-muted-foreground">{post.title}</p>
        </div>
        <ApplicationsManager applications={applications} />
      </div>
    </AppShell>
  );
}
