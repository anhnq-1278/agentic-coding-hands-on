"use client";

import { useEffect, useRef } from "react";
import useSWR from "swr";
import { KudosCreamCard } from "@/components/kudos/kudos-cream-card";
import { useKudosFeed } from "@/hooks/use-kudos-feed";
import type { KudosFilters, SunnerProfile } from "@/lib/kudos/types";

type SunnerDirectory = Record<string, SunnerProfile>;

type Props = {
  filters: KudosFilters;
  viewerId: string;
  copy: {
    heartLabel: string;
    copyLinkLabel: string;
    copyLinkToast: string;
    viewDetailsLabel: string;
    heartErrorMessage: string;
    hashtagOverflowLabel: string;
    anonymousDefaultName: string;
    emptyKudosMessage: string;
    loadingLabel: string;
    noMoreLabel: string;
  };
  onSelectHashtag: (tag: string) => void;
};

async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as T;
}

/**
 * `C.2_Danh sách lời cảm ơn` (`2940:13482`) — infinite-scroll feed of
 * KUDOpost cards. Uses an `IntersectionObserver` sentinel to trigger
 * `loadMore` once the user nears the end of the rendered list.
 */
export function KudosAllList({
  filters,
  viewerId,
  copy,
  onSelectHashtag,
}: Props) {
  const feed = useKudosFeed(filters);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Bulk Sunner directory — joins sender/recipient IDs from feed items
  // into rendered profile data. Real backend would inline the joined
  // fields on the feed response and remove this round-trip.
  const sunnersById = useSWR<{ sunners: SunnerDirectory }>(
    "/api/kudos/sunners",
    fetcher,
  );

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && feed.hasMore && !feed.isLoadingMore) {
            feed.loadMore();
          }
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [feed]);

  const sunners = sunnersById.data?.sunners;

  if (feed.isLoadingInitial) {
    return (
      <div className="rounded-2xl border border-saa-divider bg-saa-bg/40 p-8 text-center text-sm text-saa-text-muted">
        {copy.loadingLabel}
      </div>
    );
  }
  if (feed.items.length === 0) {
    return (
      <div className="rounded-2xl border border-saa-divider bg-saa-bg/40 p-8 text-center text-base font-medium text-saa-text-muted">
        {copy.emptyKudosMessage}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {feed.items.map((kudos) => {
        const sender = sunners?.[kudos.senderId];
        const recipient = sunners?.[kudos.recipientId];
        if (!sender || !recipient) return null;
        return (
          <KudosCreamCard
            key={kudos.id}
            kudos={kudos}
            sender={sender}
            recipient={recipient}
            variant="post"
            viewerId={viewerId}
            copy={copy}
            onSelectHashtag={onSelectHashtag}
          />
        );
      })}
      <div ref={sentinelRef} aria-hidden className="h-1" />
      {!feed.hasMore && (
        <p className="py-4 text-center text-sm text-saa-text-muted">
          {copy.noMoreLabel}
        </p>
      )}
      {feed.isLoadingMore && (
        <p className="py-4 text-center text-sm text-saa-text-muted">
          {copy.loadingLabel}
        </p>
      )}
    </div>
  );
}
