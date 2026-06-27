import { describe, it, expect } from "vitest";
import { initials, timeAgo, STAGE_LABELS } from "@/lib/labels";

describe("initials", () => {
  it("takes the first letters of up to two words, uppercased", () => {
    expect(initials("Ada Founder")).toBe("AF");
    expect(initials("bruno")).toBe("B");
    expect(initials("Mary Jane Watson")).toBe("MJ");
  });
});

describe("timeAgo", () => {
  it("returns 'just now' for very recent times", () => {
    expect(timeAgo(new Date())).toBe("just now");
    expect(timeAgo(new Date(Date.now() - 30 * 1000))).toBe("just now");
  });

  it("formats minutes, hours, and days", () => {
    expect(timeAgo(new Date(Date.now() - 5 * 60 * 1000))).toBe("5m");
    expect(timeAgo(new Date(Date.now() - 3 * 60 * 60 * 1000))).toBe("3h");
    expect(timeAgo(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000))).toBe("2d");
  });

  it("accepts ISO strings", () => {
    const iso = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    expect(timeAgo(iso)).toBe("1h");
  });
});

describe("STAGE_LABELS", () => {
  it("maps every enum value to a human label", () => {
    expect(STAGE_LABELS.IDEA).toBe("Idea");
    expect(STAGE_LABELS.EARLY_TRACTION).toBe("Early traction");
  });
});
