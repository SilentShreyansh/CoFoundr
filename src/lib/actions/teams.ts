"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { notifyUser } from "@/lib/notify";
import { applicationSchema } from "@/lib/validations/application";

export async function applyToPost(values: unknown) {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return { error: "You must be logged in." };
  }

  const parsed = applicationSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }
  const { postId, type, role, message } = parsed.data;

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true, title: true, status: true },
  });
  if (!post || post.status !== "PUBLISHED") return { error: "Idea not available." };
  if (post.authorId === userId) return { error: "You can't apply to your own idea." };

  // Re-applying after a withdrawal/rejection resets the same (post, applicant, type) row.
  await prisma.application.upsert({
    where: { postId_applicantId_type: { postId, applicantId: userId, type } },
    create: { postId, applicantId: userId, type, role, message: message || null },
    update: { role, message: message || null, status: "PENDING" },
  });

  await notifyUser({
    userId: post.authorId,
    actorId: userId,
    type: "JOIN_REQUEST",
    entityId: postId,
    message: `New application to join "${post.title}"`,
  });

  revalidatePath(`/posts/${postId}`);
  revalidatePath(`/posts/${postId}/applications`);
  return { ok: true };
}

export async function withdrawApplication(applicationId: string) {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return { error: "You must be logged in." };
  }

  const app = await prisma.application.findUnique({ where: { id: applicationId } });
  if (!app) return { error: "Application not found." };
  if (app.applicantId !== userId) return { error: "Not your application." };

  await prisma.application.update({
    where: { id: applicationId },
    data: { status: "WITHDRAWN" },
  });
  revalidatePath(`/posts/${app.postId}`);
  return { ok: true };
}

export async function decideApplication(
  applicationId: string,
  decision: "ACCEPTED" | "REJECTED",
) {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return { error: "You must be logged in." };
  }

  const app = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { post: { select: { id: true, authorId: true, title: true } } },
  });
  if (!app) return { error: "Application not found." };
  if (app.post.authorId !== userId) return { error: "Only the founder can decide." };

  await prisma.application.update({
    where: { id: applicationId },
    data: { status: decision },
  });

  if (decision === "ACCEPTED") {
    await prisma.startupTeam.upsert({
      where: { postId_userId: { postId: app.postId, userId: app.applicantId } },
      create: {
        postId: app.postId,
        userId: app.applicantId,
        role: app.role ?? "DEVELOPER",
      },
      update: { role: app.role ?? "DEVELOPER" },
    });
  }

  await notifyUser({
    userId: app.applicantId,
    actorId: userId,
    type: decision === "ACCEPTED" ? "REQUEST_ACCEPTED" : "REQUEST_REJECTED",
    entityId: app.postId,
    message:
      decision === "ACCEPTED"
        ? `You were accepted to "${app.post.title}"`
        : `Your application to "${app.post.title}" was declined`,
  });

  revalidatePath(`/posts/${app.postId}`);
  revalidatePath(`/posts/${app.postId}/applications`);
  return { ok: true };
}

export async function removeTeamMember(postId: string, memberUserId: string) {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return { error: "You must be logged in." };
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true },
  });
  if (!post) return { error: "Idea not found." };
  if (post.authorId !== userId) return { error: "Only the founder can manage the team." };

  await prisma.startupTeam.deleteMany({ where: { postId, userId: memberUserId } });
  revalidatePath(`/posts/${postId}`);
  return { ok: true };
}
