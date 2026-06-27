"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return null;
  return user;
}

export async function setUserBanned(userId: string, banned: boolean) {
  const admin = await requireAdmin();
  if (!admin) return { error: "Forbidden" };
  if (admin.id === userId) return { error: "You can't ban yourself." };

  await prisma.user.update({ where: { id: userId }, data: { banned } });
  revalidatePath("/admin");
  return { ok: true };
}

export async function adminDeletePost(postId: string) {
  const admin = await requireAdmin();
  if (!admin) return { error: "Forbidden" };

  await prisma.post.delete({ where: { id: postId } });
  revalidatePath("/admin");
  revalidatePath("/feed");
  return { ok: true };
}

export async function resolveReport(
  reportId: string,
  status: "RESOLVED" | "DISMISSED",
) {
  const admin = await requireAdmin();
  if (!admin) return { error: "Forbidden" };

  await prisma.report.update({
    where: { id: reportId },
    data: { status, resolvedAt: new Date() },
  });
  revalidatePath("/admin");
  return { ok: true };
}
