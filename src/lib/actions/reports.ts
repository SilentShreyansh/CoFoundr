"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

const reportSchema = z.object({
  targetType: z.enum(["POST", "USER", "COMMENT"]),
  targetId: z.string().min(1),
  reason: z.string().min(5, "Please add a short reason").max(500),
});

export async function createReport(values: unknown) {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return { error: "You must be logged in." };
  }

  const parsed = reportSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid report" };
  }

  await prisma.report.create({
    data: { reporterId: userId, ...parsed.data },
  });
  return { ok: true };
}
