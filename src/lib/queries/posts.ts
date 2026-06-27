import { Prisma, type StartupStage } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type FeedSort = "latest" | "trending" | "liked" | "commented";

export interface FeedParams {
  sort?: FeedSort;
  page?: number;
  pageSize?: number;
  q?: string;
  industry?: string;
  tag?: string;
  skill?: string;
  stage?: string;
  authorId?: string;
  savedByUserId?: string;
}

function cardInclude(viewerId?: string) {
  return {
    author: {
      select: { id: true, name: true, username: true, image: true },
    },
    images: { orderBy: { order: "asc" }, take: 1 },
    _count: { select: { likes: true, comments: true, savedBy: true, applications: true } },
    likes: viewerId
      ? { where: { userId: viewerId }, select: { id: true } }
      : (false as const),
    savedBy: viewerId
      ? { where: { userId: viewerId }, select: { id: true } }
      : (false as const),
  } satisfies Prisma.PostInclude;
}

function orderFor(sort: FeedSort): Prisma.PostOrderByWithRelationInput {
  switch (sort) {
    case "liked":
      return { likes: { _count: "desc" } };
    case "commented":
      return { comments: { _count: "desc" } };
    case "trending":
      return { likes: { _count: "desc" } };
    case "latest":
    default:
      return { publishedAt: "desc" };
  }
}

export async function getFeedPosts(params: FeedParams, viewerId?: string) {
  const {
    sort = "latest",
    page = 0,
    pageSize = 10,
    q,
    industry,
    tag,
    skill,
    stage,
    authorId,
    savedByUserId,
  } = params;

  const where: Prisma.PostWhereInput = { status: "PUBLISHED" };

  if (authorId) where.authorId = authorId;
  if (industry) where.industry = { equals: industry, mode: "insensitive" };
  if (tag) where.tags = { has: tag };
  if (skill) where.skillsNeeded = { has: skill };
  if (stage) where.stage = stage as StartupStage;
  if (savedByUserId) where.savedBy = { some: { userId: savedByUserId } };
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { tags: { has: q } },
    ];
  }
  if (sort === "trending") {
    where.publishedAt = { gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) };
  }

  const posts = await prisma.post.findMany({
    where,
    include: cardInclude(viewerId),
    orderBy: orderFor(sort),
    skip: page * pageSize,
    take: pageSize + 1, // fetch one extra to detect another page
  });

  const hasMore = posts.length > pageSize;
  const items = (hasMore ? posts.slice(0, pageSize) : posts).map((p) => ({
    ...p,
    likedByMe: Array.isArray(p.likes) ? p.likes.length > 0 : false,
    savedByMe: Array.isArray(p.savedBy) ? p.savedBy.length > 0 : false,
  }));

  return { items, nextPage: hasMore ? page + 1 : null };
}

export type FeedPost = Awaited<ReturnType<typeof getFeedPosts>>["items"][number];

export async function getPostById(id: string, viewerId?: string) {
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
          profile: { select: { headline: true } },
        },
      },
      images: { orderBy: { order: "asc" } },
      _count: { select: { likes: true, comments: true, savedBy: true, applications: true } },
      likes: viewerId
        ? { where: { userId: viewerId }, select: { id: true } }
        : false,
      savedBy: viewerId
        ? { where: { userId: viewerId }, select: { id: true } }
        : false,
    },
  });
  if (!post) return null;
  return {
    ...post,
    likedByMe: Array.isArray(post.likes) ? post.likes.length > 0 : false,
    savedByMe: Array.isArray(post.savedBy) ? post.savedBy.length > 0 : false,
  };
}

export async function getPostComments(postId: string) {
  return prisma.comment.findMany({
    where: { postId, parentId: null },
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { id: true, name: true, username: true, image: true } },
      replies: {
        orderBy: { createdAt: "asc" },
        include: {
          author: { select: { id: true, name: true, username: true, image: true } },
        },
      },
    },
  });
}
