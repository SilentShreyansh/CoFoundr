import { AppShell } from "@/components/layout/app-shell";
import { Feed } from "@/components/feed/feed";

export const metadata = { title: "Feed · CoFoundr" };

export default function FeedPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-4 text-xl font-bold">Discover startup ideas</h1>
        <Feed />
      </div>
    </AppShell>
  );
}
