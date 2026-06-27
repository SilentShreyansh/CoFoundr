import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { AppShell } from "@/components/layout/app-shell";
import { PostForm } from "@/components/post/post-form";
import type { PostInput } from "@/lib/validations/post";

export const metadata = { title: "Edit idea · CoFoundr" };

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const post = await prisma.post.findUnique({
    where: { id },
    include: { images: { orderBy: { order: "asc" } } },
  });
  if (!post) notFound();
  if (post.authorId !== user.id) redirect(`/posts/${id}`);

  const defaults: Partial<PostInput> = {
    title: post.title,
    description: post.description,
    industry: post.industry ?? "",
    stage: post.stage,
    skillsNeeded: post.skillsNeeded,
    tags: post.tags,
    teamSizeNeeded: post.teamSizeNeeded ?? undefined,
    images: post.images.map((i) => i.url),
    status: post.status === "ARCHIVED" ? "DRAFT" : post.status,
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold">Edit idea</h1>
        <PostForm postId={post.id} defaultValues={defaults} />
      </div>
    </AppShell>
  );
}
