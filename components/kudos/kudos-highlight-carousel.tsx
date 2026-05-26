"use client";

import Image from "next/image";
import { useState } from "react";
import { KudosCreamCard } from "@/components/kudos/kudos-cream-card";
import type { Kudos, SunnerProfile } from "@/lib/kudos/types";

type Props = {
  items: readonly Kudos[];
  sunnersById: Record<string, SunnerProfile> | undefined;
  viewerId: string;
  copy: {
    heartLabel: string;
    copyLinkLabel: string;
    copyLinkToast: string;
    viewDetailsLabel: string;
    heartErrorMessage: string;
    hashtagOverflowLabel: string;
    anonymousDefaultName: string;
    pagerLabel: string;
    prevLabel: string;
    nextLabel: string;
  };
  onSelectHashtag: (tag: string) => void;
};

const VISIBLE_WIDTH_DESKTOP = 528 + 24; // card width + gap
const CARDS_VISIBLE = 3;

/**
 * `B.2_HIGHLIGHT KUDOS` (`2940:13461`) — 3-card filmstrip carousel.
 *
 * Layout per Figma:
 *   - Full-bleed track 1440×525 (cards 528×525 with gap 24).
 *   - Left & right gradient fade overlays (400×525, linear-gradient from
 *     `#00101A` 50% → transparent) with circular prev/next buttons in the
 *     center of each.
 *   - Below the track sits `B.5_slide` pager: prev arrow + `current/total`
 *     label + next arrow (all centered).
 */
export function KudosHighlightCarousel({
  items,
  sunnersById,
  viewerId,
  copy,
  onSelectHashtag,
}: Props) {
  // Reset slide to 0 when the `items` reference changes (filter applied).
  const [state, setState] = useState<{
    items: readonly Kudos[];
    index: number;
  }>({ items, index: 0 });
  if (state.items !== items) {
    setState({ items, index: 0 });
  }
  const index = state.items === items ? state.index : 0;
  const setIndex = (next: number | ((prev: number) => number)) =>
    setState((prev) => ({
      items: prev.items,
      index: typeof next === "function" ? next(prev.index) : next,
    }));
  const total = items.length;

  if (total === 0) return null;
  const maxIndex = Math.max(0, total - CARDS_VISIBLE);
  const safeIndex = Math.min(index, maxIndex);
  const atStart = safeIndex === 0;
  const atEnd = safeIndex === maxIndex;

  const translatePx = -safeIndex * VISIBLE_WIDTH_DESKTOP;

  return (
    <div className="flex flex-col gap-4">
      {/* Filmstrip — kept within the page content width (no negative
          margin escape). Side gradient overlays fade neighbouring cards
          into the dark background; prev/next arrows sit inside the
          gradient zone on each edge. */}
      <div className="relative">
        <div className="overflow-hidden">
          <ul
            className="flex items-stretch gap-6 transition-transform duration-300 ease-out motion-reduce:transition-none"
            style={{ transform: `translateX(${translatePx}px)` }}
          >
            {items.map((kudos) => {
              const sender = sunnersById?.[kudos.senderId];
              const recipient = sunnersById?.[kudos.recipientId];
              if (!sender || !recipient) {
                return (
                  <li
                    key={kudos.id}
                    className="h-[525px] w-[528px] shrink-0 rounded-2xl border-4 border-saa-cta-bg/40 bg-[#FFF8E1]/40"
                  />
                );
              }
              return (
                <li key={kudos.id} className="flex shrink-0">
                  <KudosCreamCard
                    kudos={kudos}
                    sender={sender}
                    recipient={recipient}
                    variant="highlight"
                    viewerId={viewerId}
                    copy={copy}
                    onSelectHashtag={onSelectHashtag}
                  />
                </li>
              );
            })}
          </ul>
        </div>

        {/* Left fade + prev arrow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 hidden w-[200px] lg:block"
          style={{
            background:
              "linear-gradient(90deg, #00101A 50%, rgba(0, 16, 26, 0) 100%)",
          }}
        />
        <CarouselArrow
          direction="prev"
          disabled={atStart}
          ariaLabel={copy.prevLabel}
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
        />

        {/* Right fade + next arrow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-[200px] lg:block"
          style={{
            background:
              "linear-gradient(270deg, #00101A 50%, rgba(0, 16, 26, 0) 100%)",
          }}
        />
        <CarouselArrow
          direction="next"
          disabled={atEnd}
          ariaLabel={copy.nextLabel}
          onClick={() => setIndex((i) => Math.min(maxIndex, i + 1))}
        />
      </div>

      {/* B.5_slide pager — gap 32, prev/next 48×48 transparent buttons,
          middle "N/total" 28px Montserrat 700. Current index renders in
          the SAA CTA yellow (`#FFEA9E`) while the "/total" tail stays
          gray `#999` — matches Figma B.5.2's active-state styling. */}
      <div className="flex items-center justify-center gap-8">
        <CarouselArrow
          direction="prev"
          size="sm"
          disabled={atStart}
          ariaLabel={copy.prevLabel}
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
        />
        {/* Active index: larger + yellow with a soft glow, separator + total
            stay smaller and gray to emphasise the current slide. */}
        <span
          aria-current="true"
          className="inline-flex items-baseline gap-1 font-bold tabular-nums tracking-tight"
          style={{
            fontFamily:
              "var(--font-montserrat), Montserrat, sans-serif",
          }}
        >
          <span
            className="text-saa-cta-bg"
            style={{
              fontSize: "40px",
              lineHeight: "48px",
              textShadow:
                "0 0 8px rgba(250, 226, 135, 0.5), 0 4px 4px rgba(0, 0, 0, 0.25)",
            }}
          >
            {safeIndex + 1}
          </span>
          <span
            style={{
              color: "#999999",
              fontSize: "28px",
              lineHeight: "36px",
            }}
          >
            /{total}
          </span>
        </span>
        <CarouselArrow
          direction="next"
          size="sm"
          disabled={atEnd}
          ariaLabel={copy.nextLabel}
          onClick={() => setIndex((i) => Math.min(maxIndex, i + 1))}
        />
      </div>
    </div>
  );
}

function CarouselArrow({
  direction,
  disabled,
  ariaLabel,
  onClick,
  size = "lg",
}: {
  direction: "prev" | "next";
  disabled: boolean;
  ariaLabel: string;
  onClick: () => void;
  size?: "lg" | "sm";
}) {
  const src =
    direction === "prev"
      ? "/assets/sun-kudos/icons/arrow-left.svg"
      : "/assets/sun-kudos/icons/arrow-right.svg";
  const dim = size === "lg" ? 60 : 28;
  const isLg = size === "lg";
  // Big arrows per Figma B.2.1/B.2.2: 80×80 transparent button, padding 10,
  // radius 4, icon 60×60. Small arrows per Figma B.5.1/B.5.3: 48×48
  // transparent button, padding 10, radius 4, icon 28×28.
  const sidePosition = isLg
    ? direction === "prev"
      ? "absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden lg:inline-flex"
      : "absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden lg:inline-flex"
    : "";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`${sidePosition} inline-flex items-center justify-center rounded bg-transparent p-2.5 transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saa-cta-bg ${
        disabled
          ? "cursor-not-allowed opacity-30"
          : "hover:bg-saa-cta-bg/10"
      } ${isLg ? "h-20 w-20" : "h-12 w-12"}`}
    >
      <Image
        src={src}
        alt=""
        width={dim}
        height={dim}
        className={isLg ? "h-[60px] w-[60px]" : "h-7 w-7"}
      />
    </button>
  );
}
