"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { profileSchema } from "@/lib/validations/profile";

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function updateProfile(values: unknown) {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return { error: "You must be logged in." };
  }

  const parsed = profileSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }
  const data = parsed.data;

  // Resolve skills → Skill rows (create missing), then sync UserSkill set.
  const skillRecords = await Promise.all(
    data.skills.map((name) =>
      prisma.skill.upsert({
        where: { slug: slugify(name) },
        update: {},
        create: { name, slug: slugify(name) },
      }),
    ),
  );

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        image: data.image || null,
        profile: {
          upsert: {
            create: {
              headline: data.headline || null,
              bio: data.bio || null,
              location: data.location || null,
              linkedinUrl: data.linkedinUrl || null,
              githubUrl: data.githubUrl || null,
              websiteUrl: data.websiteUrl || null,
              experienceLevel: data.experienceLevel ?? null,
              startupInterests: data.startupInterests,
              openToCofound: data.openToCofound,
            },
            update: {
              headline: data.headline || null,
              bio: data.bio || null,
              location: data.location || null,
              linkedinUrl: data.linkedinUrl || null,
              githubUrl: data.githubUrl || null,
              websiteUrl: data.websiteUrl || null,
              experienceLevel: data.experienceLevel ?? null,
              startupInterests: data.startupInterests,
              openToCofound: data.openToCofound,
            },
          },
        },
      },
    }),
    prisma.userSkill.deleteMany({ where: { userId } }),
    prisma.userSkill.createMany({
      data: skillRecords.map((s) => ({ userId, skillId: s.id })),
      skipDuplicates: true,
    }),
  ]);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { username: true },
  });

  revalidatePath("/settings/profile");
  if (user) revalidatePath(`/u/${user.username}`);
  return { ok: true };
}
