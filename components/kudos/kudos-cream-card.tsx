"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useClipboardCopy } from "@/hooks/use-clipboard-copy";
import { useKudosHeart } from "@/hooks/use-kudos-heart";
import {
  HeroBadgeHoverCard,
  SunnerAvatarHoverCard,
} from "@/components/kudos/kudos-hover-cards";
import { KudosImageLightbox } from "@/components/kudos/kudos-image-lightbox";
import { KudosMessage } from "@/components/kudos/kudos-message";
import type { Kudos, SunnerProfile } from "@/lib/kudos/types";

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

type Props = {
  kudos: Kudos;
  sender: SunnerLike;
  recipient: SunnerLike;
  /** `highlight` = compact card for the carousel, `post` = full card for All Kudos. */
  variant: "highlight" | "post";
  viewerId: string;
  copy: {
    heartLabel: string;
    copyLinkLabel: string;
    copyLinkToast: string;
    viewDetailsLabel: string;
    heartErrorMessage: string;
    hashtagOverflowLabel: string;
    anonymousDefaultName: string;
  };
  onSelectHashtag?: (tag: string) => void;
};

const FONT_FAMILY =
  "var(--font-montserrat), Montserrat, sans-serif" as const;

/**
 * Cream-themed Kudos card. Mirrors Figma:
 *   - Highlight: B.3 (528×525, padding 24/24/16, radius 16, border 4px yellow)
 *   - Post: C.3 (680×749, padding 40/40/16, radius 24, no border)
 *
 * Both share the same internal layout:
 *   1. Top row — sender info | arrow icon | recipient info (space-between).
 *   2. Yellow divider.
 *   3. Time + category badge + message (inside an inner yellow-tinted box).
 *   4. Hashtag row (red text).
 *   5. Yellow divider.
 *   6. Action row — Hearts (count + icon) left, Copy Link + View Details right.
 */
export function KudosCreamCard({
  kudos,
  sender,
  recipient,
  variant,
  viewerId,
  copy,
  onSelectHashtag,
}: Props) {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const isHighlight = variant === "highlight";
  const isSelfAuthored = kudos.senderId === viewerId;

  const heart = useKudosHeart({
    initial: kudos,
    isSelfAuthored,
    errorMessage: copy.heartErrorMessage,
  });
  const copyToClipboard = useClipboardCopy({
    successMessage: copy.copyLinkToast,
  });

  function handleCopy() {
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    void copyToClipboard(`${origin}${kudos.detailUrl}`);
  }

  return (
    <article
      data-variant={variant}
      className={
        isHighlight
          ? "flex h-full w-[528px] max-w-full flex-shrink-0 flex-col gap-4 rounded-2xl border-4 border-saa-cta-bg bg-[#FFF8E1] p-6 text-[#00101A] shadow-[0_8px_32px_rgba(0,0,0,0.25)]"
          : "flex w-full flex-col gap-4 rounded-3xl bg-[#FFF8E1] px-10 pb-4 pt-10 text-[#00101A]"
      }
      style={{ fontFamily: FONT_FAMILY }}
    >
      {/* People row */}
      <div className="flex items-start justify-between gap-3">
        {kudos.isAnonymous ? (
          <AnonymousPersonBlock
            displayName={
              kudos.anonymousAlias ?? copy.anonymousDefaultName
            }
          />
        ) : (
          <PersonBlock sunner={sender} />
        )}
        <div className="flex h-full items-center px-2 pt-4">
          <Image
            src="/assets/sun-kudos/icons/send.svg"
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 opacity-70 [filter:invert(0.4)]"
          />
        </div>
        <PersonBlock sunner={recipient} />
      </div>

      {/* Yellow divider */}
      <hr className="h-px w-full border-0 bg-saa-cta-bg" />

      {/* Body */}
      <div className="flex flex-col gap-3">
        <p className="text-sm font-bold text-[#999999]">
          {formatTimestamp(kudos.createdAt)}
        </p>
        {kudos.headline && (
          <p className="text-center text-base font-bold text-[#00101A]">
            {kudos.headline}
          </p>
        )}
        <Link
          href={kudos.detailUrl}
          className="block rounded-xl border border-saa-cta-bg bg-saa-cta-bg/40 px-6 py-4 text-[#00101A] transition-opacity hover:opacity-90"
        >
          <KudosMessage
            message={kudos.message}
            className={
              isHighlight
                ? "line-clamp-3 text-base font-medium"
                : "line-clamp-5 text-base font-medium"
            }
          />
        </Link>

        {!isHighlight && kudos.images.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {kudos.images.slice(0, 5).map((src, i) => (
              <li key={`${src}-${i}`}>
                <button
                  type="button"
                  onClick={() => setLightboxSrc(src)}
                  aria-label="Mở ảnh"
                  className="relative h-22 w-22 overflow-hidden rounded-md ring-1 ring-[#998C5F] transition-all hover:ring-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saa-cta-bg"
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes="88px"
                    className="object-cover"
                  />
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* B.4.3 / C.3.7 — single red hashtag row (clickable per tag to
            apply the Hashtag filter). Renders ALL hashtags, comma-separated
            visually but each one is its own clickable button. */}
        {kudos.hashtags.length > 0 && (
          <p
            className="flex flex-wrap items-center gap-x-2 gap-y-1 text-base font-bold tracking-[0.5px] text-[#D4271D]"
            aria-label="Hashtags"
          >
            {kudos.hashtags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => onSelectHashtag?.(tag)}
                className="hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saa-cta-bg"
              >
                #{tag}
              </button>
            ))}
          </p>
        )}
      </div>

      {/* Yellow divider */}
      <hr className="h-px w-full border-0 bg-saa-cta-bg" />

      {/* Action row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => void heart.toggle()}
          disabled={isSelfAuthored || heart.isPending}
          aria-pressed={heart.isHearted}
          aria-label={copy.heartLabel}
          className={`group inline-flex items-center gap-2 rounded-md px-1 py-1 text-2xl font-bold transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saa-cta-bg ${
            heart.isHearted ? "text-red-500" : "text-[#00101A]"
          } ${isSelfAuthored ? "cursor-not-allowed opacity-50" : "hover:opacity-80"}`}
        >
          <span className="tabular-nums">{heart.heartsCount.toLocaleString("vi-VN")}</span>
          <HeartIcon filled={heart.isHearted} />
        </button>

        {/* Buttons row — flat text-only buttons per Figma B.4.4 / C.4.2:
            56px tall, padding 16, radius 4, NO border NO bg, text BEFORE
            icon, gap 4 between text and icon. Icons inlined so they use
            `currentColor` (the surrounding dark text colour). */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex h-14 items-center gap-1 rounded p-4 text-base font-bold tracking-[0.15px] text-[#00101A] transition-colors hover:bg-saa-cta-bg/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saa-cta-bg"
          >
            <span>{copy.copyLinkLabel}</span>
            <CopyLinkIcon />
          </button>
          {/* View Details — only on Highlight variant (Figma B.4.4); All
              Kudos post cards already live in the feed. */}
          {isHighlight && (
            <Link
              href={kudos.detailUrl}
              className="inline-flex h-14 items-center gap-1 rounded p-4 text-base font-bold tracking-[0.15px] text-[#00101A] transition-colors hover:bg-saa-cta-bg/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saa-cta-bg"
            >
              <span>{copy.viewDetailsLabel}</span>
              <ArrowUpRightIcon />
            </Link>
          )}
        </div>
      </div>

      <KudosImageLightbox
        src={lightboxSrc}
        onClose={() => setLightboxSrc(null)}
      />
    </article>
  );
}

function AnonymousPersonBlock({ displayName }: { displayName: string }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-3 text-center">
      <div
        aria-hidden
        className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#998C5F]/40 ring-2 ring-white"
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-9 w-9 text-[#666666]"
          aria-hidden
        >
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4Z" />
        </svg>
      </div>
      <div className="flex flex-col items-center gap-1">
        <p className="text-sm font-bold leading-tight text-[#00101A]">
          {displayName}
        </p>
      </div>
    </div>
  );
}

function PersonBlock({ sunner }: { sunner: SunnerLike }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-3 text-center">
      <SunnerAvatarHoverCard sunner={sunner} popoverSide="bottom">
        <Link
          href={`/sunner/${sunner.id}`}
          className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full ring-2 ring-white"
        >
          <Image
            src={sunner.avatarUrl}
            alt={sunner.displayName}
            fill
            sizes="64px"
            className="object-cover"
          />
        </Link>
      </SunnerAvatarHoverCard>
      <div className="flex flex-col items-center gap-1">
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          <HeroBadgeHoverCard badge={sunner.badge} popoverSide="bottom" />
        </div>
        <Link
          href={`/sunner/${sunner.id}`}
          className="text-sm font-bold leading-tight text-[#00101A] transition-opacity hover:opacity-80"
        >
          {sunner.displayName}
        </Link>
        <p className="text-xs font-medium text-[#666666]">
          {sunner.title}
        </p>
      </div>
    </div>
  );
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())} - ${pad(
    d.getMonth() + 1,
  )}/${pad(d.getDate())}/${d.getFullYear()}`;
}

function CopyLinkIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className="h-6 w-6"
    >
      <path d="M10.9619 13.1547C11.3719 13.5447 11.3719 14.1847 10.9619 14.5747C10.5719 14.9647 9.93189 14.9647 9.54189 14.5747C7.5919 12.6247 7.5919 9.4547 9.54189 7.5047L13.0819 3.9647C15.0319 2.0147 18.2019 2.0147 20.1519 3.9647C22.1019 5.9147 22.1019 9.0847 20.1519 11.0347L18.6619 12.5247C18.6719 11.7047 18.5419 10.8847 18.2619 10.1047L18.7319 9.6247C19.9119 8.4547 19.9119 6.5547 18.7319 5.3847C17.5619 4.2047 15.6619 4.2047 14.4919 5.3847L10.9619 8.9147C9.7819 10.0847 9.7819 11.9847 10.9619 13.1547ZM13.7819 8.9147C14.1719 8.5247 14.8119 8.5247 15.2019 8.9147C17.1519 10.8647 17.1519 14.0347 15.2019 15.9847L11.6619 19.5247C9.71189 21.4747 6.54189 21.4747 4.59189 19.5247C2.64189 17.5747 2.64189 14.4047 4.59189 12.4547L6.08189 10.9647C6.07189 11.7847 6.20189 12.6047 6.48189 13.3947L6.01189 13.8647C4.83189 15.0347 4.83189 16.9347 6.01189 18.1047C7.18189 19.2847 9.08189 19.2847 10.2519 18.1047L13.7819 14.5747C14.9619 13.4047 14.9619 11.5047 13.7819 10.3347C13.3719 9.9447 13.3719 9.3047 13.7819 8.9147Z" />
    </svg>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={`h-8 w-8 transition-transform ${filled ? "scale-110" : ""}`}
    >
      <path d="M27.4 7.2a6.4 6.4 0 0 0-9.1 0L16 9.6l-2.3-2.4a6.4 6.4 0 1 0-9.1 9.1l2.4 2.3L16 28.4l9-9.4 2.4-2.3a6.4 6.4 0 0 0 0-9.5Z" />
    </svg>
  );
}

function ArrowUpRightIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="h-6 w-6"
    >
      <line x1="7" y1="17" x2="17" y2="7" />
      <polyline points="7 7 17 7 17 17" />
    </svg>
  );
}
