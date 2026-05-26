"use client";

import Image from "next/image";
import Link from "next/link";
import type { HeroBadge, StarTier, SunnerProfile } from "@/lib/kudos/types";

type SunnerLike = Pick<
  SunnerProfile,
  "id" | "displayName" | "avatarUrl" | "departmentName" | "title" | "badge"
> & { kudosReceived?: number };

type Props = {
  sunner: SunnerLike;
  /** Maps display order — `sender` row above `direction` icon, `recipient` below. */
  variant: "sender" | "recipient";
};

const BADGE_SRC: Record<HeroBadge, string> = {
  new: "/assets/sun-kudos/badges/new-hero.png",
  rising: "/assets/sun-kudos/badges/rising-hero.png",
  legend: "/assets/sun-kudos/badges/legend-hero.png",
  super: "/assets/sun-kudos/badges/super-hero.png",
};

export function getStarTier(kudosReceived: number): StarTier {
  if (kudosReceived >= 50) return 3;
  if (kudosReceived >= 20) return 2;
  if (kudosReceived >= 10) return 1;
  return 0;
}

/**
 * `C.3.1` / `C.3.3` info block — avatar + name (link to profile) + badge +
 * star tier + title + department. Used by both Highlight and All Kudos card
 * variants.
 */
export function SenderRecipientBlock({ sunner, variant }: Props) {
  const stars = getStarTier(sunner.kudosReceived ?? 0);
  return (
    <div
      className="flex items-center gap-3"
      data-variant={variant}
      style={{
        fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
      }}
    >
      <Link
        href={`/sunner/${sunner.id}`}
        className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full ring-2 ring-saa-divider transition-shadow hover:ring-saa-cta-bg/60"
      >
        <Image
          src={sunner.avatarUrl}
          alt={sunner.displayName}
          fill
          sizes="64px"
          className="object-cover"
        />
      </Link>
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/sunner/${sunner.id}`}
            className="truncate text-base font-bold text-saa-text-primary transition-colors hover:text-saa-cta-bg"
          >
            {sunner.displayName}
          </Link>
          <Image
            src={BADGE_SRC[sunner.badge]}
            alt=""
            width={109}
            height={19}
            className="h-4 w-auto"
          />
          {stars > 0 && (
            <span
              aria-label={`${stars} hoa thị`}
              className="text-sm leading-none text-saa-cta-bg"
            >
              {"★".repeat(stars)}
            </span>
          )}
        </div>
        <p className="truncate text-xs font-medium text-saa-text-muted">
          {sunner.title} · {sunner.departmentName}
        </p>
      </div>
    </div>
  );
}
