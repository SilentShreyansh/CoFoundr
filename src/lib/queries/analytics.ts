import { prisma } from "@/lib/prisma";

export async function getFounderAnalytics(userId: string) {
  const posts = await prisma.post.findMany({
    where: { authorId: userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      status: true,
      viewCount: true,
      createdAt: true,
      _count: {
        select: { likes: true, comments: true, savedBy: true, applications: true, views: true },
      },
    },
  });

  const totals = posts.reduce(
    (acc, p) => ({
      views: acc.views + p.viewCount,
      uniqueViews: acc.uniqueViews + p._count.views,
      likes: acc.likes + p._count.likes,
      comments: acc.comments + p._count.comments,
      saves: acc.saves + p._count.savedBy,
      applications: acc.applications + p._count.applications,
    }),
    { views: 0, uniqueViews: 0, likes: 0, comments: 0, saves: 0, applications: 0 },
  );

  return { posts, totals };
}
