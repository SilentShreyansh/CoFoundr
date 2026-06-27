import { z } from "zod";

export const STAGES = [
  "IDEA",
  "PROTOTYPE",
  "MVP",
  "EARLY_TRACTION",
  "GROWTH",
  "SCALING",
] as const;

export const postSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(120),
  description: z
    .string()
    .min(20, "Tell us a bit more — at least 20 characters")
    .max(5000),
  industry: z.string().max(60).optional().or(z.literal("")),
  stage: z.enum(STAGES),
  skillsNeeded: z.array(z.string().min(1)).max(15).default([]),
  teamSizeNeeded: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.coerce.number().int().min(1).max(50).optional(),
  ),
  tags: z.array(z.string().min(1)).max(10).default([]),
  images: z
    .array(
      z.string().refine(
        (val) =>
          val === "" ||
          val.startsWith("/") ||
          val.startsWith("http://") ||
          val.startsWith("https://"),
        { message: "Must be a valid URL or local path" },
      ),
    )
    .max(6)
    .default([]),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
});

export const commentSchema = z.object({
  postId: z.string().min(1),
  parentId: z.string().optional(),
  content: z.string().min(1, "Comment can't be empty").max(2000),
});

export type PostInput = z.infer<typeof postSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
