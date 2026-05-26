"use client";

import useSWR from "swr";
import { KudosFilterDropdowns } from "@/components/kudos/kudos-filter-dropdowns";
import { KudosHighlightCarousel } from "@/components/kudos/kudos-highlight-carousel";
import { KudosSectionHeader } from "@/components/kudos/kudos-section-header";
import type { Kudos, KudosFilters, SunnerProfile } from "@/lib/kudos/types";

type Props = {
  filters: KudosFilters;
  viewerId: string;
  copy: {
    eyebrow: string;
    title: string;
    heartLabel: string;
    copyLinkLabel: string;
    copyLinkToast: string;
    viewDetailsLabel: string;
    heartErrorMessage: string;
    hashtagOverflowLabel: string;
    anonymousDefaultName: string;
    emptyKudosMessage: string;
    loadingLabel: string;
    pagerLabel: string;
    prevLabel: string;
    nextLabel: string;
    filterHashtagLabel: string;
    filterDepartmentLabel: string;
    filterClearLabel: string;
  };
  onSelectHashtag: (tag: string | null) => void;
  onSelectDepartment: (id: string | null) => void;
};

async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as T;
}

function highlightKey(filters: KudosFilters): string {
  const params = new URLSearchParams();
  if (filters.hashtag) params.set("hashtag", filters.hashtag);
  if (filters.departmentId) params.set("department", filters.departmentId);
  const q = params.toString();
  return q ? `/api/kudos/highlight?${q}` : "/api/kudos/highlight";
}

export function KudosHighlightBand({
  filters,
  viewerId,
  copy,
  onSelectHashtag,
  onSelectDepartment,
}: Props) {
  const highlight = useSWR<{ items: readonly Kudos[] }>(
    highlightKey(filters),
    fetcher,
  );
  const directory = useSWR<{
    sunners: Record<string, SunnerProfile>;
  }>("/api/kudos/sunners", fetcher);

  return (
    <section className="flex flex-col gap-10">
      <KudosSectionHeader
        caption={copy.eyebrow}
        title={copy.title}
        rightSlot={
          <KudosFilterDropdowns
            filters={filters}
            copy={{
              hashtagLabel: copy.filterHashtagLabel,
              departmentLabel: copy.filterDepartmentLabel,
              clearLabel: copy.filterClearLabel,
            }}
            onSelectHashtag={onSelectHashtag}
            onSelectDepartment={onSelectDepartment}
          />
        }
      />

      {highlight.isLoading || !directory.data ? (
        <div className="rounded-2xl border border-saa-divider bg-saa-bg/40 p-8 text-center text-sm text-saa-text-muted">
          {copy.loadingLabel}
        </div>
      ) : highlight.data && highlight.data.items.length > 0 ? (
        <KudosHighlightCarousel
          items={highlight.data.items}
          sunnersById={directory.data.sunners}
          viewerId={viewerId}
          copy={copy}
          onSelectHashtag={(tag) => onSelectHashtag(tag)}
        />
      ) : (
        <div className="rounded-2xl border border-saa-divider bg-saa-bg/40 p-8 text-center text-base font-medium text-saa-text-muted">
          {copy.emptyKudosMessage}
        </div>
      )}
    </section>
  );
}
