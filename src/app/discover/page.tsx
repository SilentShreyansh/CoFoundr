import Link from "next/link";
import { redirect } from "next/navigation";
import { Sparkles, Lightbulb, Users, Handshake } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { getRecommendations } from "@/lib/queries/recommendations";
import { initials } from "@/lib/labels";
import { AppShell } from "@/components/layout/app-shell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const metadata = { title: "Discover · CoFoundr" };

interface SuggestedUser {
  id: string;
  name: string;
  username: string;
  image: string | null;
  profile: { headline: string | null } | null;
}

function PersonRow({ user }: { user: SuggestedUser }) {
  return (
    <Link
      href={`/u/${user.username}`}
      className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-accent"
    >
      <Avatar>
        {user.image && <AvatarImage src={user.image} alt={user.name} />}
        <AvatarFallback>{initials(user.name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate font-medium">{user.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {user.profile?.headline ?? `@${user.username}`}
        </p>
      </div>
    </Link>
  );
}

export default async function DiscoverPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { startups, founders, cofounders } = await getRecommendations(user.id);
  const empty =
    startups.length === 0 && founders.length === 0 && cofounders.length === 0;

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">Discover</h1>
        </div>

        {empty && (
          <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Add skills and startup interests to your{" "}
            <Link href="/settings/profile" className="text-primary hover:underline">
              profile
            </Link>{" "}
            to get personalized recommendations.
          </p>
        )}

        {startups.length > 0 && (
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase text-muted-foreground">
              <Lightbulb className="h-4 w-4" /> Startups for you
            </h2>
            <div className="space-y-3">
              {startups.map((p) => (
                <Link
                  key={p.id}
                  href={`/posts/${p.id}`}
                  className="block rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent"
                >
                  <p className="font-medium">{p.title}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {p.description}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">by {p.author.name}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {cofounders.length > 0 && (
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase text-muted-foreground">
              <Handshake className="h-4 w-4" /> Potential co-founders
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {cofounders.map((u) => (
                <PersonRow key={u.id} user={u} />
              ))}
            </div>
          </section>
        )}

        {founders.length > 0 && (
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase text-muted-foreground">
              <Users className="h-4 w-4" /> People to follow
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {founders.map((u) => (
                <PersonRow key={u.id} user={u} />
              ))}
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
