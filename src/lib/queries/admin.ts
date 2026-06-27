import { prisma } from "@/lib/prisma";

export async function getAdminStats() {
  const [users, posts, comments, applications, openReports] = await Promise.all([
    prisma.user.count(),
    prisma.post.count(),
    prisma.comment.count(),
    prisma.application.count(),
    prisma.report.count({ where: { status: "OPEN" } }),
  ]);
  return { users, posts, comments, applications, openReports };
}

export async function listUsers(take = 50) {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      role: true,
      banned: true,
      createdAt: true,
      _count: { select: { posts: true } },
    },
  });
}

export async function listPosts(take = 50) {
  return prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      title: true,
      status: true,
      createdAt: true,
      author: { select: { name: true, username: true } },
    },
  });
}

export async function listReports(take = 50) {
  return prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    take,
    include: {
      reporter: { select: { name: true, username: true } },
    },
  });
}
