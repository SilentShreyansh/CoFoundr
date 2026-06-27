import { z } from "zod";

export const EXPERIENCE_LEVELS = [
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
  "EXPERT",
] as const;

const urlOrEmpty = z.string().url("Enter a valid URL").optional().or(z.literal(""));

export const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(60),
  image: z
    .string()
    .refine(
      (val) =>
        val === "" ||
        val.startsWith("/") ||
        val.startsWith("http://") ||
        val.startsWith("https://"),
      { message: "Must be a valid URL or local path" },
    )
    .optional()
    .or(z.literal("")),
  headline: z.string().max(120).optional().or(z.literal("")),
  bio: z.string().max(1000).optional().or(z.literal("")),
  location: z.string().max(80).optional().or(z.literal("")),
  linkedinUrl: urlOrEmpty,
  githubUrl: urlOrEmpty,
  websiteUrl: urlOrEmpty,
  experienceLevel: z.preprocess(
    (v) => (v === "" || v === null ? undefined : v),
    z.enum(EXPERIENCE_LEVELS).optional(),
  ),
  startupInterests: z.array(z.string().min(1)).max(12).default([]),
  skills: z.array(z.string().min(1)).max(20).default([]),
  openToCofound: z.boolean().default(true),
});

export type ProfileInput = z.infer<typeof profileSchema>;
