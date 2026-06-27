import Link from "next/link";
import { Trophy, Heart, MessageCircle, Bookmark } from "lucide-react";
import { getWeeklyLeaderboard } from "@/lib/queries/leaderboard";
import { initials } from "@/lib/labels";
import { AppShell } from "@/components/layout/app-shell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const metadata = { title: "Leaderboard · CoFoundr" };
// Always rendered on-demand — it reads live engagement data.
export const dynamic = "force-dynamic";

const RANK_COLORS = ["text-yellow-500", "text-zinc-400", "text-amber-700"];

export default async function LeaderboardPage() {
  const { weekStart, topIdeas, topFounders } = await getWeeklyLeaderboard();

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-500" />
          <div>
            <h1 className="text-xl font-bold">Weekly leaderboard</h1>
            <p className="text-xs text-muted-foreground">
              Week of{" "}
              {weekStart.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase text-muted-foreground">
            Top ideas
          </h2>
          {topIdeas.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No activity yet this week. Engage with ideas to shape the ranking.
            </p>
          ) : (
            <ol className="divide-y divide-border overflow-hidden rounded-xl border border-border">
              {topIdeas.map((idea, i) => (
                <li key={idea.id}>
                  <Link
                    href={`/posts/${idea.id}`}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent"
                  >
                    <span
                      className={`w-6 text-center text-lg font-bold ${RANK_COLORS[i] ?? "text-muted-foreground"}`}
                    >
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{idea.title}</p>
                      <p className="text-xs text-muted-foreground">
                        by {idea.author.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {idea._count.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        {idea._count.comments}
                      </span>
                      <span className="flex items-center gap-1">
                        <Bookmark className="h-3 w-3" />
                        {idea._count.savedBy}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase text-muted-foreground">
            Top founders
          </h2>
          {topFounders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No founders ranked yet.</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {topFounders.map((f, i) => (
                <Link
                  key={f.id}
                  href={`/u/${f.username}`}
                  className="flex items-center gap-2 rounded-full border border-border bg-card py-1.5 pl-1.5 pr-4 transition-colors hover:bg-accent"
                >
                  <span className="w-5 text-center text-sm font-bold text-muted-foreground">
                    {i + 1}
                  </span>
                  <Avatar className="size-7">
                    {f.image && <AvatarImage src={f.image} alt={f.name} />}
                    <AvatarFallback className="text-[10px]">
                      {initials(f.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{f.name}</span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
