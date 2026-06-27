import { describe, it, expect } from "vitest";
import { loginSchema, signupSchema } from "@/lib/validations/auth";
import { postSchema } from "@/lib/validations/post";
import { profileSchema } from "@/lib/validations/profile";

describe("auth schemas", () => {
  it("accepts a valid login", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "x" }).success).toBe(true);
  });
  it("rejects a bad email", () => {
    expect(loginSchema.safeParse({ email: "nope", password: "x" }).success).toBe(false);
  });
  it("requires an 8+ char signup password", () => {
    expect(
      signupSchema.safeParse({ name: "Ada", email: "a@b.com", password: "short" }).success,
    ).toBe(false);
    expect(
      signupSchema.safeParse({ name: "Ada", email: "a@b.com", password: "longenough" }).success,
    ).toBe(true);
  });
});

describe("postSchema", () => {
  const base = { title: "A great idea", description: "x".repeat(25), stage: "IDEA" };

  it("coerces an empty teamSizeNeeded to undefined (not 0)", () => {
    const parsed = postSchema.safeParse({ ...base, teamSizeNeeded: "" });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.teamSizeNeeded).toBeUndefined();
  });

  it("coerces a numeric string teamSizeNeeded", () => {
    const parsed = postSchema.safeParse({ ...base, teamSizeNeeded: "3" });
    expect(parsed.success && parsed.data.teamSizeNeeded).toBe(3);
  });

  it("rejects an invalid stage", () => {
    expect(postSchema.safeParse({ ...base, stage: "NOPE" }).success).toBe(false);
  });

  it("defaults array fields", () => {
    const parsed = postSchema.safeParse(base);
    expect(parsed.success && parsed.data.skillsNeeded).toEqual([]);
    expect(parsed.success && parsed.data.tags).toEqual([]);
  });

  it("allows relative path images and absolute urls", () => {
    const parsed = postSchema.safeParse({
      ...base,
      images: ["/uploads/img.png", "http://example.com/img.jpg"],
    });
    expect(parsed.success).toBe(true);
  });
});

describe("profileSchema", () => {
  it("turns an empty experienceLevel into undefined", () => {
    const parsed = profileSchema.safeParse({ name: "Ada", experienceLevel: "" });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.experienceLevel).toBeUndefined();
  });

  it("rejects an invalid URL", () => {
    expect(profileSchema.safeParse({ name: "Ada", linkedinUrl: "not-a-url" }).success).toBe(false);
  });

  it("allows empty-string URLs", () => {
    expect(profileSchema.safeParse({ name: "Ada", linkedinUrl: "" }).success).toBe(true);
  });

  it("allows relative image path for local uploads and absolute urls", () => {
    expect(profileSchema.safeParse({ name: "Ada", image: "/uploads/12345.png" }).success).toBe(true);
    expect(profileSchema.safeParse({ name: "Ada", image: "https://example.com/pic.jpg" }).success).toBe(true);
    expect(profileSchema.safeParse({ name: "Ada", image: "invalid-url" }).success).toBe(false);
  });
});
