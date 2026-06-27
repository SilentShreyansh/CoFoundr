import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getFeedPosts } from "@/lib/queries/posts";
import { AppShell } from "@/components/layout/app-shell";
import { PostCard } from "@/components/post/post-card";

export const metadata = { title: "Saved · CoFoundr" };

export default async function SavedPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { items: posts } = await getFeedPosts(
    { savedByUserId: user.id, pageSize: 50 },
    user.id,
  );

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-4 text-xl font-bold">Saved ideas</h1>
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
          {posts.length === 0 && (
            <p className="py-16 text-center text-sm text-muted-foreground">
              You haven&apos;t saved any ideas yet.
            </p>
          )}
        </div>
      </div>
    </AppShell>
  );
}
