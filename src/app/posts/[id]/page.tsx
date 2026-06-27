import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { getPostById, getPostComments } from "@/lib/queries/posts";
import { getPostTeam, getMyApplication } from "@/lib/queries/teams";
import { initials, timeAgo, STAGE_LABELS } from "@/lib/labels";
import { AppShell } from "@/components/layout/app-shell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PostInteractions } from "@/components/post/post-interactions";
import { PostOwnerActions } from "@/components/post/post-owner-actions";
import { ReportButton } from "@/components/post/report-button";
import { ShareButton } from "@/components/post/share-button";
import { Comments } from "@/components/post/comments";
import { ApplyPanel } from "@/components/team/apply-panel";
import { TeamMembers } from "@/components/team/team-members";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id },
    select: { title: true, description: true, images: { take: 1, select: { url: true } } },
  });
  if (!post) return { title: "Idea not found · CoFoundr" };
  const description = post.description.slice(0, 160);
  return {
    title: `${post.title} · CoFoundr`,
    description,
    openGraph: {
      title: post.title,
      description,
      images: post.images[0]?.url ? [post.images[0].url] : undefined,
    },
  };
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const viewer = await getCurrentUser();
  const post = await getPostById(id, viewer?.id);

  if (!post) notFound();
  const isOwner = viewer?.id === post.author.id;
  if (post.status !== "PUBLISHED" && !isOwner) notFound();

  // Record a unique view (once per signed-in viewer, excluding the author).
  if (viewer && !isOwner) {
    const seen = await prisma.postView.findUnique({
      where: { postId_userId: { postId: id, userId: viewer.id } },
    });
    if (!seen) {
      await prisma.$transaction([
        prisma.postView.create({ data: { postId: id, userId: viewer.id } }),
        prisma.post.update({ where: { id }, data: { viewCount: { increment: 1 } } }),
      ]);
    }
  }

  const comments = await getPostComments(id);
  const team = await getPostTeam(id);
  const isMember = !!viewer && team.some((m) => m.user.id === viewer.id);
  const myApplication =
    viewer && !isOwner ? await getMyApplication(id, viewer.id) : null;

  return (
    <AppShell>
      <article className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center gap-3">
          <Avatar>
            {post.author.image && (
              <AvatarImage src={post.author.image} alt={post.author.name} />
            )}
            <AvatarFallback>{initials(post.author.name)}</AvatarFallback>
          </Avatar>
          <div className="text-sm">
            <Link href={`/u/${post.author.username}`} className="font-medium hover:underline">
              {post.author.name}
            </Link>
            {post.author.profile?.headline && (
              <p className="text-xs text-muted-foreground">
                {post.author.profile.headline}
              </p>
            )}
          </div>
          <span className="ml-auto text-xs text-muted-foreground">
            {timeAgo(post.publishedAt ?? post.createdAt)}
          </span>
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{STAGE_LABELS[post.stage]}</Badge>
            {post.industry && <Badge variant="outline">{post.industry}</Badge>}
            {post.status === "DRAFT" && <Badge>Draft</Badge>}
          </div>
          <h1 className="mt-3 text-2xl font-bold">{post.title}</h1>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
            {post.description}
          </p>
        </div>

        {post.images.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {post.images.map((img) => (
              <div
                key={img.id}
                className="relative aspect-video overflow-hidden rounded-lg border border-border"
              >
                <Image
                  src={img.url}
                  alt={post.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 320px"
                />
              </div>
            ))}
          </div>
        )}

        {(post.skillsNeeded.length > 0 || post.tags.length > 0) && (
          <div className="space-y-3">
            {post.skillsNeeded.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs font-medium uppercase text-muted-foreground">
                  Looking for
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {post.skillsNeeded.map((s) => (
                    <Badge
                      key={s}
                      className="bg-primary text-primary-foreground border-transparent shadow-xs font-semibold"
                    >
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {post.tags.map((t) => (
                  <Badge key={t} variant="secondary">
                    #{t}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between border-y border-border py-3">
          <PostInteractions
            postId={post.id}
            initialLiked={post.likedByMe}
            initialSaved={post.savedByMe}
            initialLikes={post._count.likes}
          />
          <div className="flex items-center gap-1">
            <ShareButton postId={post.id} title={post.title} />
            {isOwner ? (
              <PostOwnerActions postId={post.id} />
            ) : (
              viewer && <ReportButton postId={post.id} />
            )}
          </div>
        </div>

        <TeamMembers postId={post.id} members={team} isOwner={isOwner} />

        {isOwner ? (
          <Link
            href={`/posts/${post.id}/applications`}
            className="block rounded-lg border border-border bg-card p-4 text-sm font-medium hover:bg-accent"
          >
            Review applications ({post._count.applications}) →
          </Link>
        ) : viewer ? (
          <ApplyPanel
            postId={post.id}
            isMember={isMember}
            application={
              myApplication
                ? {
                    id: myApplication.id,
                    status: myApplication.status,
                    type: myApplication.type,
                  }
                : null
            }
          />
        ) : null}

        <Comments
          postId={post.id}
          currentUserId={viewer?.id ?? null}
          comments={comments}
        />
      </article>
    </AppShell>
  );
}
