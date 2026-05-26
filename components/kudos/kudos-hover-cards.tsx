"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import type { HeroBadge, SunnerProfile } from "@/lib/kudos/types";

/**
 * Small grace period before the popover closes after the cursor leaves.
 * Prevents flicker when the mouse transits between two adjacent triggers
 * and gives the user time to start interacting with the popover content.
 */
const HOVER_CLOSE_DELAY_MS = 120;

function useHoverOpen() {
  const [open, setOpen] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearTimer() {
    if (closeTimerRef.current !== null) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }

  function show() {
    clearTimer();
    setOpen(true);
  }

  function hide() {
    clearTimer();
    closeTimerRef.current = setTimeout(() => {
      setOpen(false);
      closeTimerRef.current = null;
    }, HOVER_CLOSE_DELAY_MS);
  }

  return { open, show, hide };
}

type SunnerLike = Pick<
  SunnerProfile,
  | "id"
  | "displayName"
  | "avatarUrl"
  | "departmentName"
  | "title"
  | "badge"
  | "kudosReceived"
>;

const BADGE_SRC: Record<HeroBadge, string> = {
  new: "/assets/sun-kudos/badges/new-hero.png",
  rising: "/assets/sun-kudos/badges/rising-hero.png",
  legend: "/assets/sun-kudos/badges/legend-hero.png",
  super: "/assets/sun-kudos/badges/super-hero.png",
};

/**
 * Tier copy per Figma `Hover danh hiệu` (`twC9br89ra` 3241:14994). The
 * description has TWO parts at runtime (the Figma text node uses inline
 * character overrides which the API flattens to a single colour):
 *   - `criteria` — criteria headline rendered in WHITE
 *   - `description` — narrative rendered in gray `#999`
 * Criteria is by NUMBER OF UNIQUE SENDERS, not raw Kudos count.
 */
const BADGE_COPY: Record<
  HeroBadge,
  { title: string; criteria: string; description: string }
> = {
  new: {
    title: "New Hero",
    criteria: "Có 1–4 người gửi Kudos cho bạn",
    description:
      "Hành trình lan tỏa điều tốt đẹp bắt đầu – những lời cảm ơn và ghi nhận đầu tiên đã tìm đến bạn.",
  },
  rising: {
    title: "Rising Hero",
    criteria: "Có 5–9 người gửi Kudos cho bạn",
    description:
      "Dấu ấn của bạn đang lan toả – nhiều đồng đội đã ghi nhận sự đóng góp của bạn.",
  },
  legend: {
    title: "Legend Hero",
    criteria: "Có 10–19 người gửi Kudos cho bạn",
    description:
      "Bạn là nguồn cảm hứng cho cộng đồng — Legend Hero của Sun*.",
  },
  super: {
    title: "Super Hero",
    criteria: "Có 20+ người gửi Kudos cho bạn",
    description:
      "Tier cao nhất — biểu tượng tinh thần Sun*. Cảm ơn vì luôn lan toả!",
  },
};

/**
 * Derive a CECV-style employee code from a Sunner id. Mock-only helper —
 * real data will populate this from a directory service. Matches the
 * Figma "CECV10" pattern shown in `I2940:13464;335:9443;256:4751`.
 */
function getEmployeeCode(sunnerId: string): string {
  const slug = sunnerId.replace(/[^a-z0-9]/gi, "");
  let hash = 5381;
  for (let i = 0; i < slug.length; i += 1) {
    hash = (((hash << 5) + hash) ^ slug.charCodeAt(i)) >>> 0;
  }
  const num = (hash % 90) + 10;
  const prefix = slug.slice(0, 4).toUpperCase().padEnd(4, "X");
  return `${prefix}${num}`;
}

/**
 * Avatar wrapper that surfaces a profile preview popover on hover/focus.
 *
 * Trigger (the wrapped avatar) gets a yellow ring on hover, matching the
 * page accent. The popover itself does NOT duplicate the avatar — its
 * trigger already shows the face. Inside, all identity + stats text is
 * **left-aligned** in a column layout; the badge is rendered as a coloured
 * text chip (no image) so it's never confused with a second avatar.
 */
export function SunnerAvatarHoverCard({
  sunner,
  children,
  popoverSide = "bottom",
}: {
  sunner: SunnerLike;
  children: React.ReactNode;
  popoverSide?: "top" | "bottom";
}) {
  const { open, show, hide } = useHoverOpen();

  return (
    <span
      className="group relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {/* Yellow ring overlay on hover/focus — drawn AFTER the trigger
          (DOM order) so it visually sits on top of the avatar's own
          white ring. `pointer-events-none` so the avatar stays
          clickable. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full ring-0 ring-saa-cta-bg/0 transition-all group-hover:ring-3 group-hover:ring-saa-cta-bg group-focus-within:ring-3 group-focus-within:ring-saa-cta-bg"
      />
      {open && (
        <span
          role="tooltip"
          onMouseEnter={show}
          onMouseLeave={hide}
          className={`pointer-events-auto absolute left-1/2 z-30 -translate-x-1/2 ${
            popoverSide === "top" ? "bottom-full pb-3" : "top-full pt-3"
          }`}
        >
          <span
            className="flex w-72 flex-col items-start gap-4 rounded-2xl border border-[#998C5F] bg-[#00070C] p-5 text-left text-saa-text-primary shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
            style={{
              fontFamily:
                "var(--font-montserrat), Montserrat, sans-serif",
            }}
          >
            {/* Identity column — name, employee code, title, department.
                All left-aligned; no avatar duplication. */}
            <span className="flex w-full flex-col gap-1 text-left">
              <Link
                href={`/sunner/${sunner.id}`}
                className="text-left text-base font-bold leading-6 text-saa-text-primary transition-colors hover:text-saa-cta-bg"
              >
                {sunner.displayName}
              </Link>
              <span className="text-left text-xs font-bold tracking-[0.1px] text-saa-text-muted">
                {getEmployeeCode(sunner.id)}
              </span>
              <span className="text-left text-xs text-saa-text-muted">
                {sunner.title}
              </span>
              <span className="text-left text-xs text-saa-text-muted">
                {sunner.departmentName}
              </span>
            </span>

            {/* Badge — text-only chip (no image to avoid an "extra avatar"
                impression). Title in yellow. */}
            <span className="flex w-full flex-col gap-1 text-left">
              <span className="inline-flex w-fit items-center rounded-full border border-saa-cta-bg/40 bg-saa-cta-bg/10 px-3 py-1 text-xs font-bold tracking-[0.1px] text-saa-cta-bg">
                {BADGE_COPY[sunner.badge].title}
              </span>
            </span>

            {/* Stats — Kudos received. Left-aligned dl. */}
            <dl className="flex w-full flex-col gap-2 text-left text-xs">
              <span className="flex items-center justify-between">
                <dt className="text-saa-text-muted">Kudos đã nhận</dt>
                <dd className="font-bold tabular-nums text-saa-text-primary">
                  {sunner.kudosReceived}
                </dd>
              </span>
            </dl>

            {/* Send Kudos CTA — full-width yellow pill with paper-plane
                icon (inline SVG using currentColor so it renders dark on
                the yellow bg). */}
            <Link
              href={`/viet-kudo?recipient=${sunner.id}`}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-saa-cta-bg px-4 text-sm font-bold text-[#00101A] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saa-cta-bg"
            >
              <PaperPlaneIcon />
              Gửi Kudos
            </Link>
          </span>
        </span>
      )}
    </span>
  );
}

/**
 * Wraps a Hero badge image with a hover/focus popover. Layout mirrors
 * Figma `Hover danh hiệu New Hero` (`twC9br89ra` / 3241:14991):
 *   - Container 304×194, padding 16, gap 16, radius 16, bg `#00070C`,
 *     flex column items-center.
 *   - Big badge pill (218×38) — 1px yellow border, radius 96 (full pill),
 *     cosmic-art background darkened ~50%, white tier text 22.8px
 *     Montserrat 700 centered.
 *   - Description text 14px Montserrat 700 gray `#999` line-height 20,
 *     letter-spacing 0.1.
 */
export function HeroBadgeHoverCard({
  badge,
  popoverSide = "bottom",
}: {
  badge: HeroBadge;
  popoverSide?: "top" | "bottom";
}) {
  const { open, show, hide } = useHoverOpen();
  const meta = BADGE_COPY[badge];

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      tabIndex={0}
      role="button"
      aria-label={meta.title}
    >
      <Image
        src={BADGE_SRC[badge]}
        alt=""
        width={109}
        height={19}
        className="h-4 w-auto"
      />
      {open && (
        <span
          role="tooltip"
          onMouseEnter={show}
          onMouseLeave={hide}
          className={`pointer-events-auto absolute left-1/2 z-30 -translate-x-1/2 ${
            popoverSide === "top" ? "bottom-full pb-3" : "top-full pt-3"
          }`}
        >
          <span
            className="flex w-[304px] flex-col items-start gap-4 rounded-2xl bg-[#00070C] p-4 text-left shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
            style={{
              fontFamily:
                "var(--font-montserrat), Montserrat, sans-serif",
            }}
          >
            {/* Big badge pill — 218×38, 1px yellow border, radius 96
                (full), cosmic-art bg darkened, white tier text centered
                inside the pill. The pill itself sits at the LEFT edge
                of the popover so layout reads top-down left-aligned. */}
            <span
              className="relative flex h-[38px] w-[218px] items-center justify-center overflow-hidden rounded-full border border-saa-cta-bg"
              style={{
                backgroundColor: "#FFF3C6",
              }}
            >
              <Image
                src="/assets/sun-kudos/images/keyvisual-bg.png"
                alt=""
                fill
                sizes="218px"
                className="pointer-events-none select-none object-cover"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  backgroundColor: "rgba(9, 36, 50, 0.50)",
                }}
              />
              <span
                className="relative z-10 font-bold tracking-[0.163px] text-saa-text-primary"
                style={{
                  fontSize: "22.808px",
                  lineHeight: "32.583px",
                }}
              >
                {meta.title}
              </span>
            </span>

            {/* Description block — 2 lines:
                • criteria (Figma "Có 1–4 người gửi Kudos cho bạn") in WHITE
                • narrative in gray `#999`
                Both 14px Montserrat 700 line-height 20 letter-spacing 0.1,
                left-aligned per Figma 3241:14994 + user feedback. */}
            <span
              className="flex w-full flex-col gap-1 text-left font-bold tracking-[0.1px]"
              style={{ fontSize: "14px", lineHeight: "20px" }}
            >
              <span className="text-left text-saa-text-primary">
                {meta.criteria}
              </span>
              <span className="text-left" style={{ color: "#999999" }}>
                {meta.description}
              </span>
            </span>
          </span>
        </span>
      )}
    </span>
  );
}

/** Paper-plane "send" icon — inline so it inherits `currentColor` from
 *  the surrounding button's text colour. */
function PaperPlaneIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="h-4 w-4"
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}
