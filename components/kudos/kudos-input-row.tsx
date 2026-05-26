"use client";

import Image from "next/image";

type Props = {
  sendPlaceholder: string;
  sendAria: string;
  searchPlaceholder: string;
  searchAria: string;
  onSendClick: () => void;
};

/**
 * `Button chuc nang` (`2940:13448`) — two pill-shaped buttons side-by-side
 * below the keyvisual: the Send-Kudos trigger + the Sunner search bar.
 *
 * Per Figma:
 *   - Send pill: 738×72, border 1px `#998C5F`, bg `rgba(255,234,158,0.10)`,
 *     radius 68, padding 24/16, gap 8, pen icon + placeholder.
 *   - Search pill: 381×72, same style, search icon + placeholder.
 *
 * The send pill is now a `<button>` (was a `<Link>`) so the parent page
 * can open the `<KudosComposerModal>` in-place instead of navigating.
 */
export function KudosInputRow({
  sendPlaceholder,
  sendAria,
  searchPlaceholder,
  searchAria,
  onSendClick,
}: Props) {
  return (
    <div
      className="flex w-full flex-col gap-3 lg:flex-row"
      style={{
        fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
      }}
    >
      <button
        type="button"
        onClick={onSendClick}
        aria-label={sendAria}
        className="group flex h-[72px] flex-1 items-center gap-2 rounded-[68px] border border-[#998C5F] bg-[#00101A]/80 px-4 py-6 text-left text-saa-text-muted transition-colors hover:border-saa-cta-bg hover:text-saa-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saa-cta-bg"
      >
        <Image
          src="/assets/sun-kudos/icons/pen.svg"
          alt=""
          width={24}
          height={24}
          className="h-6 w-6 shrink-0"
        />
        <span className="truncate text-base font-medium">
          {sendPlaceholder}
        </span>
      </button>

      <label
        className="group flex h-[72px] w-full items-center gap-2 rounded-[68px] border border-[#998C5F] bg-[#00101A]/80 px-4 py-6 text-saa-text-muted focus-within:border-saa-cta-bg focus-within:text-saa-text-primary lg:w-[381px]"
      >
        <Image
          src="/assets/sun-kudos/icons/search.svg"
          alt=""
          width={24}
          height={24}
          className="h-6 w-6 shrink-0"
        />
        <input
          type="search"
          aria-label={searchAria}
          placeholder={searchPlaceholder}
          maxLength={100}
          className="min-w-0 flex-1 bg-transparent text-base font-medium text-saa-text-primary placeholder:text-saa-text-muted focus:outline-none"
        />
      </label>
    </div>
  );
}
