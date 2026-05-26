import Image from "next/image";
import Link from "next/link";
import type { AwardCategory } from "@/lib/awards/catalog";

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

type Props = {
  category: AwardCategory;
  /** Short description rendered under the title — resolved by the caller
   *  using the current locale (vi vs en). */
  description: string;
  /** Label for the "Details" CTA link, locale-aware. */
  detailLabel: string;
};

/**
 * One award card from `mms_C2_Award list`. Layout:
 *   [Picture-Award 336×336 — composite: bg PNG + name-label PNG overlay]
 *   gap-6
 *   [Title (24/32 Montserrat 400 yellow)]
 *   [Description (16/24 Montserrat 400 white)]
 *   [Chi tiết link with arrow]
 *
 * Per the implement-ui rule on composite image nodes: the bg + label are
 * stacked layers, NOT a single flattened image, because the labels have
 * smaller native dimensions than the 336×336 background.
 */
export function AwardCard({ category, description, detailLabel }: Props) {
  const fontFamily =
    "var(--font-montserrat), Montserrat, sans-serif" as const;
  const href = `/awards-information#${category.slug}`;

  return (
    <article className="group flex w-[336px] flex-col gap-6 transition-transform duration-200 hover:-translate-y-1">
      {/* Picture-Award — composite */}
      <Link
        href={href}
        aria-label={`${category.title} — chi tiết`}
        className="relative block h-[336px] w-[336px] overflow-hidden rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saa-cta-bg"
        style={{
          boxShadow:
            "0 4px 4px 0 rgba(0, 0, 0, 0.25), 0 0 6px 0 var(--color-saa-glow)",
        }}
      >
        <Image
          src="/assets/homepage-saa/images/award-bg.png"
          alt=""
          fill
          sizes="336px"
          className="object-cover"
        />
        <span
          aria-hidden
          className="absolute inset-0 flex items-center justify-center"
        >
          <Image
            src={category.labelSrc}
            alt=""
            width={category.labelWidth}
            height={category.labelHeight}
            className="select-none"
          />
        </span>
      </Link>

      {/* Frame 490 — text below the picture */}
      <div className="flex flex-col gap-1">
        <Link href={href} className="block">
          <h3
            className="text-2xl font-normal leading-8 text-saa-cta-bg"
            style={{ fontFamily, fontWeight: 400 }}
          >
            {category.title}
          </h3>
        </Link>
        <p
          className="line-clamp-2 text-base leading-6 tracking-[0.5px] text-saa-text-primary"
          style={{ fontFamily, fontWeight: 400 }}
        >
          {description}
        </p>
        <Link
          href={href}
          className="mt-4 flex items-center gap-1 text-saa-text-primary transition-colors hover:text-saa-cta-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saa-cta-bg"
          style={{ fontFamily }}
        >
          <span className="text-base font-medium leading-6 tracking-[0.15px]">
            {detailLabel}
          </span>
          <span className="h-6 w-6">{ARROW_UP_RIGHT}</span>
        </Link>
      </div>
    </article>
  );
}
