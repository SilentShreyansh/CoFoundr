import Link from "next/link";
import { redirect } from "next/navigation";
import { Eye, Heart, MessageCircle, Bookmark, Users, BarChart3 } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { getFounderAnalytics } from "@/lib/queries/analytics";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Dashboard · CoFoundr" };

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { posts, totals } = await getFounderAnalytics(user.id);

  const stats = [
    { label: "Views", value: totals.views, icon: Eye },
    { label: "Unique views", value: totals.uniqueViews, icon: BarChart3 },
    { label: "Likes", value: totals.likes, icon: Heart },
    { label: "Comments", value: totals.comments, icon: MessageCircle },
    { label: "Saves", value: totals.saves, icon: Bookmark },
    { label: "Applications", value: totals.applications, icon: Users },
  ];

  // Prepare chart data (up to 5 recent ideas)
  const chartPosts = [...posts].slice(0, 5).reverse();
  const maxViews = Math.max(...chartPosts.map((p) => p.viewCount), 10);

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-xl font-bold">Founder dashboard</h1>

        {/* Swipeable Analytics Cards Carousel on Mobile */}
        <div className="flex gap-3 overflow-x-auto smooth-scroll select-none -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory pb-2 md:pb-0 md:grid md:grid-cols-3 shrink-0">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-border bg-card p-4 min-w-[155px] sm:min-w-0 snap-center shadow-xs flex-1 shrink-0"
            >
              <div className="flex items-center gap-2 text-muted-foreground">
                <s.icon className="h-4 w-4 shrink-0 text-primary" />
                <span className="text-[11px] font-semibold uppercase tracking-wider truncate">{s.label}</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Dynamic Engagement Chart */}
        {chartPosts.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-4 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Views Engagement Trend
              </h2>
              <span className="text-[10px] text-muted-foreground font-medium">Top ideas</span>
            </div>
            <div className="relative h-32 sm:h-40 w-full">
              <svg viewBox="0 0 500 160" className="h-full w-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Horizontal Guide Lines */}
                <line x1="40" y1="20" x2="480" y2="20" stroke="currentColor" className="text-border" strokeWidth="0.5" strokeDasharray="4" />
                <line x1="40" y1="70" x2="480" y2="70" stroke="currentColor" className="text-border" strokeWidth="0.5" strokeDasharray="4" />
                <line x1="40" y1="120" x2="480" y2="120" stroke="currentColor" className="text-border" strokeWidth="0.5" strokeDasharray="4" />
                
                {/* Path Render */}
                {(() => {
                  const points = chartPosts.map((p, idx) => {
                    const x = 40 + (idx * 440) / Math.max(chartPosts.length - 1, 1);
                    const y = 120 - (p.viewCount * 100) / maxViews;
                    return { x, y };
                  });
                  const pathData = points.reduce((acc, p, idx) => 
                    idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`, ""
                  );
                  const areaData = pathData + ` L ${points[points.length - 1].x} 120 L ${points[0].x} 120 Z`;
                  return (
                    <>
                      <path d={areaData} fill="url(#chartGrad)" />
                      <path d={pathData} fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      {points.map((p, idx) => (
                        <circle
                          key={idx}
                          cx={p.x}
                          cy={p.y}
                          r="4"
                          fill="var(--background)"
                          stroke="var(--primary)"
                          strokeWidth="2.5"
                        />
                      ))}
                    </>
                  );
                })()}
              </svg>
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground px-6 font-medium">
              {chartPosts.map((p, idx) => (
                <span key={idx} className="truncate max-w-[65px] text-center" title={p.title}>
                  {p.title}
                </span>
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase text-muted-foreground tracking-wider">
            Your ideas
          </h2>
          {posts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              You haven&apos;t posted any ideas yet.
            </p>
          ) : (
            <>
              {/* Responsive Cards Stack for Mobile */}
              <div className="space-y-3 md:hidden">
                {posts.map((p) => (
                  <div key={p.id} className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <Link href={`/posts/${p.id}`} className="font-semibold text-sm hover:underline block text-foreground truncate max-w-[200px]">
                        {p.title}
                      </Link>
                      {p.status !== "PUBLISHED" && (
                        <Badge variant="outline" className="text-xs uppercase font-semibold">{p.status}</Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-4 gap-2 pt-2 border-t border-border/50 text-center">
                      <div>
                        <p className="text-sm font-bold text-foreground">{p.viewCount}</p>
                        <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">Views</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{p._count.likes}</p>
                        <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">Likes</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{p._count.comments}</p>
                        <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">Comments</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{p._count.applications}</p>
                        <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">Apps</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-hidden rounded-xl border border-border bg-card">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
                    <tr>
                      <th className="px-4 py-2.5 font-semibold uppercase tracking-wider">Idea</th>
                      <th className="px-2 py-2.5 font-semibold uppercase tracking-wider">Views</th>
                      <th className="px-2 py-2.5 font-semibold uppercase tracking-wider">Likes</th>
                      <th className="px-2 py-2.5 font-semibold uppercase tracking-wider">Comments</th>
                      <th className="px-2 py-2.5 font-semibold uppercase tracking-wider">Apps</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {posts.map((p) => (
                      <tr key={p.id} className="hover:bg-accent/50 transition-colors">
                        <td className="px-4 py-3.5">
                          <Link href={`/posts/${p.id}`} className="font-semibold text-foreground hover:underline">
                            {p.title}
                          </Link>{" "}
                          {p.status !== "PUBLISHED" && (
                            <Badge variant="outline" className="ml-1 text-xs">{p.status}</Badge>
                          )}
                        </td>
                        <td className="px-2 py-3.5 text-muted-foreground font-medium">{p.viewCount}</td>
                        <td className="px-2 py-3.5 text-muted-foreground font-medium">{p._count.likes}</td>
                        <td className="px-2 py-3.5 text-muted-foreground font-medium">{p._count.comments}</td>
                        <td className="px-2 py-3.5 text-muted-foreground font-medium">{p._count.applications}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
