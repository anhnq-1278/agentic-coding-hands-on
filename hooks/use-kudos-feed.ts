"use client";

import { useMemo } from "react";
import useSWRInfinite from "swr/infinite";
import type { FeedPage, Kudos, KudosFilters } from "@/lib/kudos/types";

async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}

const PAGE_LIMIT = 20;

/**
 * Infinite-scroll feed hook. Returns flattened items, load-more handle,
 * and a `mutate` reference to invalidate the cache.
 */
export function useKudosFeed(filters: KudosFilters) {
  const getKey = useMemo(
    () =>
      (
        pageIndex: number,
        previousPage: FeedPage | null,
      ): string | null => {
        if (previousPage && previousPage.nextCursor === null) {
          return null;
        }
        const cursor = previousPage?.nextCursor ?? null;
        const params = new URLSearchParams();
        if (filters.hashtag) params.set("hashtag", filters.hashtag);
        if (filters.departmentId) params.set("department", filters.departmentId);
        if (cursor) params.set("cursor", cursor);
        params.set("limit", String(PAGE_LIMIT));
        return `/api/kudos/feed?${params.toString()}`;
      },
    [filters.hashtag, filters.departmentId],
  );

  const swr = useSWRInfinite<FeedPage>(getKey, fetcher, {
    revalidateFirstPage: false,
  });

  const items: Kudos[] = swr.data
    ? swr.data.flatMap((p) => [...p.items])
    : [];
  const lastPage = swr.data?.[swr.data.length - 1];
  const hasMore = lastPage ? lastPage.nextCursor !== null : true;
  const isLoadingInitial = !swr.data && !swr.error;
  const isLoadingMore =
    swr.isValidating && (swr.data?.length ?? 0) > 0;

  return {
    items,
    hasMore,
    isLoadingInitial,
    isLoadingMore,
    error: swr.error,
    loadMore: () => swr.setSize(swr.size + 1),
    mutate: swr.mutate,
  };
}
