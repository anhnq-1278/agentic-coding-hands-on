import Link from "next/link";

type Props = {
  aboutAwardsLabel: string;
  aboutKudosLabel: string;
};

const ARROW_UP_RIGHT = (
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
    <path d="M7 7h10v10" />
    <path d="M7 17 17 7" />
  </svg>
);

/**
 * mms_B3_Call-To-Action — two CTA buttons.
 * - mms_B3.1 ABOUT AWARDS: solid `#FFEA9E` bg, dark text.
 * - mms_B3.2 ABOUT KUDOS: tinted bg `rgba(255, 234, 158, 0.10)`, white text, gold border.
 */
export function HomepageCtaPair({ aboutAwardsLabel, aboutKudosLabel }: Props) {
  const fontFamily =
    "var(--font-montserrat), Montserrat, sans-serif" as const;

  return (
    <div className="flex items-start gap-10">
      <Link
        href="/awards-information"
        className="flex h-[60px] items-center justify-start gap-2 rounded-lg bg-saa-cta-bg px-6 py-4 text-saa-cta-text shadow-sm transition-shadow duration-150 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40"
      >
        <span
          className="text-[22px] font-bold leading-7"
          style={{ fontFamily }}
        >
          {aboutAwardsLabel}
        </span>
        <span className="h-6 w-6 text-saa-cta-text">{ARROW_UP_RIGHT}</span>
      </Link>

      <Link
        href="/sun-kudos"
        className="flex h-[60px] items-center justify-start gap-2 rounded-lg border border-saa-border px-6 py-4 text-saa-text-primary transition-colors hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40"
        style={{ background: "rgba(255, 234, 158, 0.10)" }}
      >
        <span
          className="text-[22px] font-bold leading-7"
          style={{ fontFamily }}
        >
          {aboutKudosLabel}
        </span>
        <span className="h-6 w-6 text-saa-text-primary">{ARROW_UP_RIGHT}</span>
      </Link>
    </div>
  );
}
