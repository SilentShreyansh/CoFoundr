import { prisma } from "@/lib/prisma";

// Lightweight content-based recommendations: score candidates by overlap of
// skills + startup interests + industry/tags. Good enough for a demo-scale graph.
export function overlap(a: string[], b: string[]) {
  const set = new Set(a.map((x) => x.toLowerCase()));
  return b.reduce((n, x) => n + (set.has(x.toLowerCase()) ? 1 : 0), 0);
}

export async function getRecommendations(userId: string) {
  const me = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      skills: { include: { skill: true } },
      profile: { select: { startupInterests: true } },
      following: { select: { followingId: true } },
      applications: { select: { postId: true } },
    },
  });
  if (!me) return { startups: [], founders: [], cofounders: [] };

  const mySkills = me.skills.map((s) => s.skill.name);
  const myInterests = me.profile?.startupInterests ?? [];
  const followingIds = new Set(me.following.map((f) => f.followingId));
  const appliedPostIds = new Set(me.applications.map((a) => a.postId));

  // Candidate startups: recent published ideas not authored by / applied to by me.
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED", authorId: { not: userId } },
    orderBy: { publishedAt: "desc" },
    take: 100,
    include: {
      author: { select: { id: true, name: true, username: true, image: true } },
      _count: { select: { likes: true, comments: true } },
    },
  });

  const startups = posts
    .filter((p) => !appliedPostIds.has(p.id))
    .map((p) => {
      const score =
        overlap(mySkills, p.skillsNeeded) * 3 +
        overlap(myInterests, p.tags) * 2 +
        (p.industry && myInterests.some((i) => i.toLowerCase() === p.industry!.toLowerCase())
          ? 2
          : 0);
      return { post: p, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((x) => x.post);

  // Candidate people: users with overlapping skills/interests.
  const users = await prisma.user.findMany({
    where: { id: { not: userId }, banned: false },
    take: 100,
    select: {
      id: true,
      name: true,
      username: true,
      image: true,
      skills: { include: { skill: true } },
      profile: { select: { headline: true, startupInterests: true, openToCofound: true } },
    },
  });

  const scoredUsers = users.map((u) => {
    const uSkills = u.skills.map((s) => s.skill.name);
    const uInterests = u.profile?.startupInterests ?? [];
    const score = overlap(mySkills, uSkills) * 2 + overlap(myInterests, uInterests) * 2;
    return { user: u, score };
  });

  const founders = scoredUsers
    .filter((x) => x.score > 0 && !followingIds.has(x.user.id))
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((x) => x.user);

  // Co-founders: open-to-cofound people, ranked by shared interests but
  // complementary skills (skills I don't already have).
  const cofounders = users
    .filter((u) => u.profile?.openToCofound && !followingIds.has(u.id))
    .map((u) => {
      const uSkills = u.skills.map((s) => s.skill.name);
      const uInterests = u.profile?.startupInterests ?? [];
      const complementary = uSkills.filter(
        (s) => !mySkills.some((m) => m.toLowerCase() === s.toLowerCase()),
      ).length;
      const score = overlap(myInterests, uInterests) * 2 + complementary;
      return { user: u, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((x) => x.user);

  return { startups, founders, cofounders };
}
