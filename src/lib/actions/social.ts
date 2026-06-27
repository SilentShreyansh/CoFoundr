"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { notifyUser } from "@/lib/notify";
import { commentSchema } from "@/lib/validations/post";

export async function toggleLike(postId: string) {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return { error: "You must be logged in." };
  }

  const existing = await prisma.like.findUnique({
    where: { postId_userId: { postId, userId } },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
  } else {
    await prisma.like.create({ data: { postId, userId } });
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true, title: true },
    });
    if (post && post.authorId !== userId) {
      await notifyUser({
        userId: post.authorId,
        actorId: userId,
        type: "LIKE",
        entityId: postId,
        message: `Someone liked your idea "${post.title}"`,
      });
    }
  }

  revalidatePath("/feed");
  revalidatePath(`/posts/${postId}`);
  return { liked: !existing };
}

export async function toggleSave(postId: string) {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return { error: "You must be logged in." };
  }

  const existing = await prisma.savedPost.findUnique({
    where: { postId_userId: { postId, userId } },
  });

  if (existing) {
    await prisma.savedPost.delete({ where: { id: existing.id } });
  } else {
    await prisma.savedPost.create({ data: { postId, userId } });
  }

  revalidatePath("/feed");
  revalidatePath("/saved");
  revalidatePath(`/posts/${postId}`);
  return { saved: !existing };
}

export async function addComment(values: unknown) {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return { error: "You must be logged in." };
  }

  const parsed = commentSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid comment" };
  }
  const { postId, parentId, content } = parsed.data;

  const comment = await prisma.comment.create({
    data: { postId, authorId: userId, parentId: parentId || null, content },
  });

  // Notify the post author (and the parent comment author for replies).
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true, title: true },
  });
  if (post && post.authorId !== userId) {
    await notifyUser({
      userId: post.authorId,
      actorId: userId,
      type: parentId ? "REPLY" : "COMMENT",
      entityId: postId,
      message: `New ${parentId ? "reply" : "comment"} on "${post.title}"`,
    });
  }

  revalidatePath(`/posts/${postId}`);
  return { id: comment.id };
}

export async function deleteComment(commentId: string) {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return { error: "You must be logged in." };
  }

  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) return { error: "Comment not found." };
  if (comment.authorId !== userId) return { error: "Not your comment." };

  await prisma.comment.delete({ where: { id: commentId } });
  revalidatePath(`/posts/${comment.postId}`);
  return { ok: true };
}
