import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { getFeedPosts, type FeedSort } from "@/lib/queries/posts";

const SORTS: FeedSort[] = ["latest", "trending", "liked", "commented"];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const viewer = await getCurrentUser();

  const sortParam = searchParams.get("sort") as FeedSort | null;
  const sort = sortParam && SORTS.includes(sortParam) ? sortParam : "latest";
  const page = Number(searchParams.get("page") ?? "0") || 0;

  const result = await getFeedPosts(
    {
      sort,
      page,
      pageSize: 10,
      q: searchParams.get("q") ?? undefined,
      industry: searchParams.get("industry") ?? undefined,
      tag: searchParams.get("tag") ?? undefined,
      skill: searchParams.get("skill") ?? undefined,
      stage: searchParams.get("stage") ?? undefined,
      authorId: searchParams.get("authorId") ?? undefined,
    },
    viewer?.id,
  );

  return NextResponse.json(result);
}
