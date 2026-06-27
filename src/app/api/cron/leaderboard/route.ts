import { NextResponse } from "next/server";
import { snapshotLeaderboard } from "@/lib/queries/leaderboard";

// Weekly snapshot of the leaderboard. Triggered by Vercel Cron (see vercel.json).
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }
  const result = await snapshotLeaderboard();
  return NextResponse.json({ ok: true, ...result });
}
