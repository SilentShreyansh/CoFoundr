import { prisma } from "@/lib/prisma";

export function startOfWeek(d = new Date()) {
  const date = new Date(d);
  const day = (date.getDay() + 6) % 7; // Monday = 0
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - day);
  return date;
}

const SCORE = { like: 3, comment: 2, save: 2 };

export async function getWeeklyLeaderboard() {
  const weekStart = startOfWeek();
  const since = { createdAt: { gte: weekStart } };

  const [likes, comments, saves] = await Promise.all([
    prisma.like.groupBy({ by: ["postId"], where: since, _count: true }),
    prisma.comment.groupBy({ by: ["postId"], where: since, _count: true }),
    prisma.savedPost.groupBy({ by: ["postId"], where: since, _count: true }),
  ]);

  const scores = new Map<string, number>();
  const add = (postId: string, n: number) =>
    scores.set(postId, (scores.get(postId) ?? 0) + n);
  likes.forEach((r) => add(r.postId, r._count * SCORE.like));
  comments.forEach((r) => add(r.postId, r._count * SCORE.comment));
  saves.forEach((r) => add(r.postId, r._count * SCORE.save));

  if (scores.size === 0) {
    return { weekStart, topIdeas: [], topFounders: [] };
  }

  const ranked = [...scores.entries()].sort((a, b) => b[1] - a[1]);
  const topIdeaIds = ranked.slice(0, 10).map(([id]) => id);

  const posts = await prisma.post.findMany({
    where: { id: { in: topIdeaIds }, status: "PUBLISHED" },
    select: {
      id: true,
      title: true,
      authorId: true,
      viewCount: true,
      author: { select: { id: true, name: true, username: true, image: true } },
      _count: { select: { likes: true, comments: true, savedBy: true } },
    },
  });

  const topIdeas = topIdeaIds
    .map((id) => {
      const post = posts.find((p) => p.id === id);
      return post ? { ...post, score: scores.get(id) ?? 0 } : null;
    })
    .filter((p): p is NonNullable<typeof p> => p !== null);

  // Top founders: sum idea scores by author across all scored posts this week.
  const allScoredIds = ranked.map(([id]) => id);
  const authorRows = await prisma.post.findMany({
    where: { id: { in: allScoredIds } },
    select: { id: true, authorId: true },
  });
  const founderScores = new Map<string, number>();
  authorRows.forEach((r) =>
    founderScores.set(
      r.authorId,
      (founderScores.get(r.authorId) ?? 0) + (scores.get(r.id) ?? 0),
    ),
  );
  const topFounderIds = [...founderScores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id]) => id);
  const founders = await prisma.user.findMany({
    where: { id: { in: topFounderIds } },
    select: { id: true, name: true, username: true, image: true },
  });
  const topFounders = topFounderIds
    .map((id) => {
      const f = founders.find((u) => u.id === id);
      return f ? { ...f, score: founderScores.get(id) ?? 0 } : null;
    })
    .filter((f): f is NonNullable<typeof f> => f !== null);

  return { weekStart, topIdeas, topFounders };
}

// Snapshot the current week into LeaderboardEntry (called by the weekly cron).
export async function snapshotLeaderboard() {
  const { weekStart, topIdeas } = await getWeeklyLeaderboard();
  await Promise.all(
    topIdeas.map((idea, i) =>
      prisma.leaderboardEntry.upsert({
        where: { postId_weekStart: { postId: idea.id, weekStart } },
        create: {
          postId: idea.id,
          weekStart,
          rank: i + 1,
          score: idea.score,
          likes: idea._count.likes,
          comments: idea._count.comments,
          saves: idea._count.savedBy,
          views: idea.viewCount,
        },
        update: {
          rank: i + 1,
          score: idea.score,
          likes: idea._count.likes,
          comments: idea._count.comments,
          saves: idea._count.savedBy,
          views: idea.viewCount,
        },
      }),
    ),
  );
  return { weekStart, count: topIdeas.length };
}
