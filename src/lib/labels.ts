import type {
  StartupStage,
  ExperienceLevel,
  TeamRole,
  ApplicationType,
} from "@prisma/client";

export const STAGE_LABELS: Record<StartupStage, string> = {
  IDEA: "Idea",
  PROTOTYPE: "Prototype",
  MVP: "MVP",
  EARLY_TRACTION: "Early traction",
  GROWTH: "Growth",
  SCALING: "Scaling",
};

export const EXPERIENCE_LABELS: Record<ExperienceLevel, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
  EXPERT: "Expert",
};

export const TEAM_ROLE_LABELS: Record<TeamRole, string> = {
  COFOUNDER: "Co-Founder",
  DEVELOPER: "Developer",
  DESIGNER: "Designer",
  MARKETING: "Marketing",
  SALES: "Sales",
  PRODUCT_MANAGER: "Product Manager",
  INVESTOR: "Investor",
  ADVISOR: "Advisor",
};

export const APPLICATION_TYPE_LABELS: Record<ApplicationType, string> = {
  COFOUNDER: "Co-Founder",
  CONTRIBUTOR: "Contributor",
  EMPLOYEE: "Employee",
  FREELANCER: "Freelancer",
};

export function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function timeAgo(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return "just now";
  // Largest unit whose threshold the elapsed time exceeds.
  const steps: [number, string][] = [
    [31536000, "y"],
    [2592000, "mo"],
    [604800, "w"],
    [86400, "d"],
    [3600, "h"],
    [60, "m"],
  ];
  for (const [divisor, label] of steps) {
    if (seconds >= divisor) return `${Math.floor(seconds / divisor)}${label}`;
  }
  return "just now";
}
