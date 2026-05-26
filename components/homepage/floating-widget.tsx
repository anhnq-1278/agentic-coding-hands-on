import Image from "next/image";
import Link from "next/link";

const PEN_ICON = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);

/**
 * mms_6_Widget Button — fixed bottom-right pill with two quick actions:
 * pen icon (Viết Kudo) + Kudos logo (Thể lệ SAA), separated by "/".
 *
 * For the UI-only pass each "icon" is a Link to a placeholder route.
 */
export function FloatingWidget() {
  const fontFamily =
    "var(--font-montserrat), Montserrat, sans-serif" as const;

  return (
    <div className="fixed bottom-6 right-5 z-30">
      <div
        className="flex items-center gap-2 rounded-full bg-saa-cta-bg p-4 text-saa-cta-text"
        style={{
          boxShadow:
            "0 4px 4px 0 rgba(0, 0, 0, 0.25), 0 0 6px 0 var(--color-saa-glow)",
        }}
      >
        <Link
          href="/profile"
          aria-label="Viết Kudo"
          className="flex h-6 w-6 items-center justify-center text-saa-cta-text transition-opacity hover:opacity-70"
        >
          {PEN_ICON}
        </Link>
        <span
          aria-hidden
          className="text-2xl font-bold leading-8"
          style={{ fontFamily }}
        >
          /
        </span>
        <Link
          href="/community-standards"
          aria-label="Thể lệ SAA"
          className="flex h-6 w-6 items-center justify-center transition-opacity hover:opacity-70"
        >
          <Image
            src="/assets/homepage-saa/icons/widget-kudos.svg"
            alt=""
            width={20}
            height={18}
            className="h-[18px] w-5"
          />
        </Link>
      </div>
    </div>
  );
}
