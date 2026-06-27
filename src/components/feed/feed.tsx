"use client";

import { useEffect, useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { PostCard, type PostCardData } from "@/components/post/post-card";

type FeedSort = "latest" | "trending" | "liked" | "commented";

const TABS: { key: FeedSort; label: string }[] = [
  { key: "latest", label: "Latest" },
  { key: "trending", label: "Trending" },
  { key: "liked", label: "Most liked" },
  { key: "commented", label: "Most discussed" },
];

interface FeedResponse {
  items: PostCardData[];
  nextPage: number | null;
}

async function fetchFeed(sort: FeedSort, page: number): Promise<FeedResponse> {
  const res = await fetch(`/api/posts?sort=${sort}&page=${page}`);
  if (!res.ok) throw new Error("Failed to load feed");
  return res.json();
}

export function Feed({ initialSort = "latest" }: { initialSort?: FeedSort }) {
  const [sort, setSort] = useState<FeedSort>(initialSort);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["feed", sort],
    queryFn: ({ pageParam }) => fetchFeed(sort, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const posts = data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <div>
      <div className="mb-4 flex gap-1 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setSort(t.key)}
            className={cn(
              "border-b-2 px-3 py-2 text-sm font-medium transition-colors",
              sort === t.key
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading && <FeedSkeleton />}
      {isError && (
        <p className="py-10 text-center text-sm text-destructive">
          Couldn&apos;t load the feed. Try again.
        </p>
      )}
      {!isLoading && posts.length === 0 && (
        <p className="py-16 text-center text-sm text-muted-foreground">
          No ideas yet. Be the first to{" "}
          <a href="/posts/new" className="text-primary hover:underline">
            share one
          </a>
          .
        </p>
      )}

      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      <div ref={loadMoreRef} className="h-10" />
      {isFetchingNextPage && (
        <p className="py-4 text-center text-sm text-muted-foreground">Loading…</p>
      )}
    </div>
  );
}

function FeedSkeleton() {
  return (
    <div className="space-y-4">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-40 animate-pulse rounded-xl border border-border bg-muted/40"
        />
      ))}
    </div>
  );
}
