"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";
import { KudosSectionHeader } from "@/components/kudos/kudos-section-header";
import type { KudosFilters, SpotlightNode } from "@/lib/kudos/types";

type Props = {
  filters: KudosFilters;
  copy: {
    eyebrow: string;
    title: string;
    countLabel: string;
    searchPlaceholder: string;
    searchSubmitLabel: string;
    searchMaxCharsError: string;
    searchRequiredError: string;
    panZoomLabel: string;
    panLabel: string;
    zoomLabel: string;
    emptyKudosMessage: string;
    loadingLabel: string;
  };
};

type SpotlightResponse = {
  nodes: readonly SpotlightNode[];
  total: number;
};

async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as T;
}

function spotlightKey(filters: KudosFilters, query: string): string {
  const params = new URLSearchParams();
  if (filters.hashtag) params.set("hashtag", filters.hashtag);
  if (filters.departmentId) params.set("department", filters.departmentId);
  if (query) params.set("q", query);
  const q = params.toString();
  return q ? `/api/kudos/spotlight?${q}` : "/api/kudos/spotlight";
}

const MIN_FONT = 16;
const MAX_FONT = 44;

/** Notification stack — 6 lines fading from oldest (top, 10% opacity) to
 *  newest (bottom, 100%). Matches Figma 3004:15999..3004:15995 + 2940:14230
 *  vertical stack at startX:191 startY:2068..2186 (565×23 each, gap 0). */
const NOTIFICATION_STACK: ReadonlyArray<{
  id: string;
  text: string;
  opacity: number;
}> = [
  { id: "notif-1", text: "08:30PM Nguyễn Bá Chức đã nhận được một Kudos mới", opacity: 0.1 },
  { id: "notif-2", text: "08:31PM Mai phương Thúy đã nhận được một Kudos mới", opacity: 0.3 },
  { id: "notif-3", text: "08:32PM Đỗ hoàng Hiệp đã nhận được một Kudos mới", opacity: 0.5 },
  { id: "notif-4", text: "08:33PM Nguyễn Hoàng Linh đã nhận được một Kudos mới", opacity: 0.7 },
  { id: "notif-5", text: "08:34PM Lê Kiều Trang đã nhận được một Kudos mới", opacity: 1 },
  { id: "notif-6", text: "08:35PM Dương thúy An đã nhận được một Kudos mới", opacity: 1 },
];

/**
 * `B.7_Spotlight` (`2940:14174`) per Figma. Container 1157×548, border
 * 1px `#998C5F`, radius 47.14, on a cosmic image + 70% black overlay.
 *
 * Floating elements:
 *   - **TL** B.7.3 search pill 219×39, padding 16/11, border `#998C5F`,
 *     bg 10% yellow, radius 46.
 *   - **TR** B.7.2 Pan/Zoom 30×30 icon button.
 *   - **Center** B.7.1 `{N} KUDOS` label 36px Montserrat 700 white.
 *   - Faded notification toasts (`14px white opacity:0.1`) scattered in
 *     the lower band — atmospheric "live activity" feel.
 *   - Scatter cloud of recipient names sized by `kudosCount`.
 */
export function KudosSpotlight({ filters, copy }: Props) {
  const [searchValue, setSearchValue] = useState("");
  const [committedQuery, setCommittedQuery] = useState("");
  const [searchError, setSearchError] = useState<string | null>(null);
  const [mode, setMode] = useState<"pan" | "zoom">("pan");
  const [zoom, setZoom] = useState(1);

  const swr = useSWR<SpotlightResponse>(
    spotlightKey(filters, committedQuery),
    fetcher,
    { keepPreviousData: true },
  );

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = searchValue.trim();
    if (trimmed.length === 0) {
      setSearchError(copy.searchRequiredError);
      return;
    }
    if (trimmed.length > 100) {
      setSearchError(copy.searchMaxCharsError);
      return;
    }
    setSearchError(null);
    setCommittedQuery(trimmed);
  }

  function handleSearchChange(value: string) {
    setSearchValue(value);
    if (value.length > 100) {
      setSearchError(copy.searchMaxCharsError);
    } else if (searchError) {
      setSearchError(null);
    }
  }

  function handlePanZoomToggle() {
    // Single-button toggle: clicking switches between fit (1×) and zoomed
    // (2×). Simple + predictable; deep zoom can be added later with a
    // wheel listener if the design calls for it.
    if (mode === "pan") {
      setMode("zoom");
      setZoom(2);
    } else {
      setMode("pan");
      setZoom(1);
    }
  }

  const nodes = swr.data?.nodes ?? [];
  const total = swr.data?.total ?? nodes.length;
  const maxCount = nodes.reduce((m, n) => Math.max(m, n.kudosCount), 1);

  return (
    <section className="flex flex-col gap-6">
      <KudosSectionHeader caption={copy.eyebrow} title={copy.title} />

      <div
        className="relative overflow-hidden rounded-[47px] border border-[#998C5F]"
        style={{
          minHeight: 548,
          fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
        }}
      >
        {/* Cosmic background + 70% black overlay (Figma `Root further mo rong 1`). */}
        <Image
          src="/assets/sun-kudos/images/keyvisual-bg.png"
          alt=""
          fill
          sizes="(min-width: 1024px) 1157px, 100vw"
          className="pointer-events-none select-none object-cover"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.70)" }}
        />

        {/* Notification stack — bottom-left box (Figma 3004:15995-15999
            + 2940:14230). 6 lines stacked vertically with fading opacity
            from oldest (10%) at top to newest (100%) at bottom. Pure
            decoration ("live activity feel"). */}
        <ul className="pointer-events-none absolute bottom-6 left-6 z-5 flex flex-col select-none">
          {NOTIFICATION_STACK.map((n) => (
            <li
              key={n.id}
              className="whitespace-nowrap text-sm font-bold tracking-[0.1px] text-white"
              style={{
                opacity: n.opacity,
                lineHeight: "20px",
              }}
            >
              {n.text}
            </li>
          ))}
        </ul>

        {/* B.7.3 Search — top-left, small pill 219×39 */}
        <form
          onSubmit={handleSearchSubmit}
          className="absolute left-6 top-6 z-20 flex items-center gap-2"
        >
          <div className="relative">
            <Image
              src="/assets/sun-kudos/icons/search.svg"
              alt=""
              width={16}
              height={16}
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60"
            />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={copy.searchPlaceholder}
              aria-label={copy.searchSubmitLabel}
              aria-invalid={Boolean(searchError)}
              aria-describedby={
                searchError ? "spotlight-search-err" : undefined
              }
              maxLength={150}
              className="h-10 w-64 rounded-full border border-[#998C5F] bg-saa-cta-bg/10 pl-9 pr-3 text-sm text-saa-text-primary backdrop-blur placeholder:text-saa-text-muted focus:border-saa-cta-bg focus:outline-none"
            />
          </div>
        </form>

        {/* B.7.2 Pan/Zoom — BOTTOM-RIGHT 30×30 icon button per Figma
            3007:17479 (startX:1231 startY:2129 in 1157×548 container =
            bottom-right ~38px from right edge, ~47px from bottom). */}
        <button
          type="button"
          onClick={handlePanZoomToggle}
          aria-pressed={mode === "zoom"}
          title={copy.panZoomLabel}
          aria-label={mode === "pan" ? copy.zoomLabel : copy.panLabel}
          className="absolute bottom-12 right-10 z-20 inline-flex h-[30px] w-[30px] items-center justify-center rounded text-saa-text-primary transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saa-cta-bg"
        >
          <ExpandIcon expanded={mode === "zoom"} />
        </button>

        {/* B.7.1 Count label — centered, 36px Montserrat 700 white */}
        <p
          className="absolute left-1/2 top-8 z-10 -translate-x-1/2 whitespace-nowrap text-center font-bold text-saa-text-primary"
          style={{ fontSize: 36, lineHeight: "44px" }}
        >
          {total} {copy.countLabel}
        </p>

        {searchError && (
          <p
            id="spotlight-search-err"
            role="alert"
            className="absolute left-6 top-20 z-20 text-sm font-medium text-red-400"
          >
            {searchError}
          </p>
        )}

        {/* Cloud canvas — `mode=zoom` scales the scatter cloud 2× via the
            ScatterCloud transform below; click the Pan/Zoom toggle again
            to return to 1×. */}
        <div
          className="relative z-10 h-[548px] w-full"
          style={{
            cursor: mode === "zoom" ? "zoom-out" : "default",
          }}
        >
          {swr.isLoading && !swr.data ? (
            <div className="flex h-full items-center justify-center text-sm text-saa-text-muted">
              {copy.loadingLabel}
            </div>
          ) : nodes.length === 0 ? (
            <div className="flex h-full items-center justify-center pt-24 text-base font-medium text-saa-text-muted">
              {copy.emptyKudosMessage}
            </div>
          ) : (
            <ScatterCloud
              nodes={nodes}
              maxCount={maxCount}
              committedQuery={committedQuery}
              zoom={zoom}
            />
          )}
        </div>
      </div>
    </section>
  );
}

/**
 * Deterministic positioned cloud. Positions derived from FNV-1a hash of
 * `recipientId`. `zoom` scales every node uniformly.
 */
function ScatterCloud({
  nodes,
  maxCount,
  committedQuery,
  zoom,
}: {
  nodes: readonly SpotlightNode[];
  maxCount: number;
  committedQuery: string;
  zoom: number;
}) {
  return (
    <div
      className="relative h-full w-full origin-center transition-transform duration-200 ease-out motion-reduce:transition-none"
      style={{ transform: `scale(${zoom})` }}
    >
      {nodes.map((node) => {
        const ratio = node.kudosCount / maxCount;
        const fontSize = MIN_FONT + ratio * (MAX_FONT - MIN_FONT);
        const [topPct, leftPct] = positionForId(node.recipientId);
        const isMatch =
          committedQuery &&
          node.displayName
            .toLowerCase()
            .includes(committedQuery.toLowerCase());
        const opacity = 0.55 + ratio * 0.45;
        const displayName =
          node.displayName.length > 22
            ? `${node.displayName.slice(0, 22)}…`
            : node.displayName;
        return (
          <Link
            key={node.recipientId}
            href={`/sun-kudos/${node.mostRecentKudosId}`}
            title={`${node.displayName} · ${formatTimestamp(
              node.mostRecentReceivedAt,
            )}`}
            className={`absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-bold transition-all hover:scale-110 hover:opacity-100 hover:text-saa-cta-bg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-saa-cta-bg ${
              isMatch
                ? "text-saa-cta-bg drop-shadow-[0_0_16px_var(--color-saa-glow)]"
                : "text-saa-text-primary"
            }`}
            style={{
              top: `${topPct}%`,
              left: `${leftPct}%`,
              fontSize: `${fontSize}px`,
              lineHeight: 1.1,
              opacity: isMatch ? 1 : opacity,
              fontFamily:
                "var(--font-montserrat), Montserrat, sans-serif",
            }}
          >
            {displayName}
          </Link>
        );
      })}
    </div>
  );
}

function positionForId(id: string): readonly [number, number] {
  let h1 = 2166136261;
  for (let i = 0; i < id.length; i += 1) {
    h1 = ((h1 ^ id.charCodeAt(i)) * 16777619) >>> 0;
  }
  let h2 = 5381;
  for (let i = id.length - 1; i >= 0; i -= 1) {
    h2 = (((h2 << 5) + h2) ^ id.charCodeAt(i)) >>> 0;
  }
  const top = 30 + (h1 % 60);
  const left = 8 + (h2 % 84);
  return [top, left];
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())} · ${pad(
    d.getDate(),
  )}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/** Expand / collapse icon — toggles between "open arrows" and "close arrows". */
function ExpandIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="h-[30px] w-[30px]"
    >
      {expanded ? (
        <>
          <polyline points="4 14 10 14 10 20" />
          <polyline points="20 10 14 10 14 4" />
          <line x1="14" y1="10" x2="21" y2="3" />
          <line x1="3" y1="21" x2="10" y2="14" />
        </>
      ) : (
        <>
          <polyline points="15 3 21 3 21 9" />
          <polyline points="9 21 3 21 3 15" />
          <line x1="21" y1="3" x2="14" y2="10" />
          <line x1="3" y1="21" x2="10" y2="14" />
        </>
      )}
    </svg>
  );
}
