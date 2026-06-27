import { prisma } from "@/lib/prisma";

const applicantSelect = {
  id: true,
  name: true,
  username: true,
  image: true,
  profile: { select: { headline: true } },
};

export async function getPostTeam(postId: string) {
  return prisma.startupTeam.findMany({
    where: { postId },
    orderBy: { joinedAt: "asc" },
    include: { user: { select: applicantSelect } },
  });
}

export async function getPostApplications(postId: string) {
  return prisma.application.findMany({
    where: { postId },
    orderBy: { createdAt: "desc" },
    include: { applicant: { select: applicantSelect } },
  });
}

export async function getMyApplication(postId: string, userId: string) {
  return prisma.application.findFirst({
    where: { postId, applicantId: userId, status: { not: "WITHDRAWN" } },
  });
}
