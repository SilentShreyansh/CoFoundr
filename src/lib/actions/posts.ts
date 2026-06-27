"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { postSchema } from "@/lib/validations/post";

type Result = { id?: string; error?: string };

export async function createPost(values: unknown): Promise<Result> {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return { error: "You must be logged in." };
  }

  const parsed = postSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }
  const data = parsed.data;
  const publishing = data.status === "PUBLISHED";

  const post = await prisma.post.create({
    data: {
      authorId: userId,
      title: data.title,
      description: data.description,
      industry: data.industry || null,
      stage: data.stage,
      skillsNeeded: data.skillsNeeded,
      teamSizeNeeded: data.teamSizeNeeded ?? null,
      tags: data.tags,
      status: data.status,
      publishedAt: publishing ? new Date() : null,
      images: {
        create: data.images.map((url, i) => ({ url, order: i })),
      },
    },
  });

  revalidatePath("/feed");
  return { id: post.id };
}

export async function updatePost(id: string, values: unknown): Promise<Result> {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return { error: "You must be logged in." };
  }

  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) return { error: "Post not found." };
  if (existing.authorId !== userId) return { error: "Not your post." };

  const parsed = postSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }
  const data = parsed.data;
  const nowPublished = data.status === "PUBLISHED";

  await prisma.$transaction([
    prisma.postImage.deleteMany({ where: { postId: id } }),
    prisma.post.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        industry: data.industry || null,
        stage: data.stage,
        skillsNeeded: data.skillsNeeded,
        teamSizeNeeded: data.teamSizeNeeded ?? null,
        tags: data.tags,
        status: data.status,
        // Set publishedAt the first time it goes public.
        publishedAt:
          nowPublished && !existing.publishedAt ? new Date() : existing.publishedAt,
        images: { create: data.images.map((url, i) => ({ url, order: i })) },
      },
    }),
  ]);

  revalidatePath("/feed");
  revalidatePath(`/posts/${id}`);
  return { id };
}

export async function deletePost(id: string): Promise<{ error?: string; ok?: boolean }> {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return { error: "You must be logged in." };
  }

  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) return { error: "Post not found." };
  if (existing.authorId !== userId) return { error: "Not your post." };

  await prisma.post.delete({ where: { id } });
  revalidatePath("/feed");
  return { ok: true };
}
