import Link from "next/link";
import { MapPin } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { getFeedPosts } from "@/lib/queries/posts";
import { searchUsers } from "@/lib/queries/search";
import { initials } from "@/lib/labels";
import { AppShell } from "@/components/layout/app-shell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PostCard } from "@/components/post/post-card";
import { SearchBar } from "@/components/search/search-bar";

export const metadata = { title: "Search · CoFoundr" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    type?: string;
    skill?: string;
    industry?: string;
    stage?: string;
    tag?: string;
  }>;
}) {
  const { q = "", type = "ideas", skill, industry, stage, tag } = await searchParams;
  const viewer = await getCurrentUser();
  const people = type === "people";

  const posts = people
    ? []
    : (await getFeedPosts({ q, skill, industry, stage, tag, pageSize: 25 }, viewer?.id))
        .items;
  const users = people ? await searchUsers(q, skill) : [];

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-5">
        <SearchBar
          initialQuery={q}
          initialType={type}
          initialIndustry={industry ?? ""}
          initialStage={stage ?? ""}
          initialTag={tag ?? ""}
        />

        {people ? (
          <div className="space-y-3 -mx-4 sm:mx-0">
            {users.map((u) => (
              <Link
                key={u.id}
                href={`/u/${u.username}`}
                className="flex items-start gap-3 rounded-none border-x-0 border-y sm:rounded-xl sm:border bg-card p-4 transition-colors hover:bg-accent"
              >
                <Avatar>
                  {u.image && <AvatarImage src={u.image} alt={u.name} />}
                  <AvatarFallback>{initials(u.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{u.name}</p>
                  <p className="text-sm text-muted-foreground">@{u.username}</p>
                  {u.profile?.headline && (
                    <p className="mt-1 text-sm text-foreground/90">{u.profile.headline}</p>
                  )}
                  {u.profile?.location && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {u.profile.location}
                    </p>
                  )}
                  {u.skills.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {u.skills.map((s) => (
                        <Badge key={s.skill.id} variant="secondary" className="text-xs">
                          {s.skill.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
            {q && users.length === 0 && (
              <p className="py-12 text-center text-sm text-muted-foreground">
                No people found for “{q}”.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4 -mx-4 sm:mx-0">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
            {q && posts.length === 0 && (
              <p className="py-12 text-center text-sm text-muted-foreground">
                No ideas found for “{q}”.
              </p>
            )}
          </div>
        )}

        {!q && !skill && !industry && !stage && !tag && (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Search for startup ideas or people to collaborate with.
          </p>
        )}
      </div>
    </AppShell>
  );
}
