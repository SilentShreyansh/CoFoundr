import { describe, it, expect } from "vitest";
import { overlap } from "@/lib/queries/recommendations";
import { startOfWeek } from "@/lib/queries/leaderboard";

describe("overlap", () => {
  it("counts shared items case-insensitively", () => {
    expect(overlap(["React", "Node"], ["node", "Go"])).toBe(1);
    expect(overlap(["React", "TypeScript"], ["react", "typescript"])).toBe(2);
  });
  it("returns 0 with no shared items", () => {
    expect(overlap(["React"], ["Design"])).toBe(0);
    expect(overlap([], ["React"])).toBe(0);
  });
});

describe("startOfWeek", () => {
  it("returns the Monday 00:00 of the given week", () => {
    // 2026-06-13 is a Saturday → week start is Monday 2026-06-08.
    const ws = startOfWeek(new Date("2026-06-13T15:30:00Z"));
    expect(ws.getDay()).toBe(1); // Monday
    expect(ws.getHours()).toBe(0);
    expect(ws.getMinutes()).toBe(0);
    expect(ws.getSeconds()).toBe(0);
  });

  it("treats Monday as the first day", () => {
    const monday = new Date("2026-06-08T09:00:00");
    const ws = startOfWeek(monday);
    expect(ws.getDate()).toBe(8);
  });
});
