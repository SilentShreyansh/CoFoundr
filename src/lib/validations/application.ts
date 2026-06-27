import { z } from "zod";

export const APPLICATION_TYPES = [
  "COFOUNDER",
  "CONTRIBUTOR",
  "EMPLOYEE",
  "FREELANCER",
] as const;

export const TEAM_ROLES = [
  "COFOUNDER",
  "DEVELOPER",
  "DESIGNER",
  "MARKETING",
  "SALES",
  "PRODUCT_MANAGER",
  "INVESTOR",
  "ADVISOR",
] as const;

export const applicationSchema = z.object({
  postId: z.string().min(1),
  type: z.enum(APPLICATION_TYPES),
  role: z.enum(TEAM_ROLES),
  message: z.string().max(1000).optional().or(z.literal("")),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;
