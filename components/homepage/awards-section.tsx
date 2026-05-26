import type { Locale } from "@/types/auth";
import { AWARD_CATALOG } from "@/lib/awards/catalog";
import { AwardCard } from "@/components/homepage/award-card";

type Props = {
  locale: Locale;
  caption: string;
  title: string;
  detailLabel: string;
};

/**
 * mms_C1_Header Giải thưởng + mms_C2_Award list.
 * Header: caption (24/32 Montserrat 700 white) → divider (#2E3940) → big
 * title (57/64 Montserrat 700 yellow). Grid: 3 columns desktop, gap 80 between
 * columns, gap 80 between the two rows.
 */
export function AwardsSection({
  locale,
  caption,
  title,
  detailLabel,
}: Props) {
  const fontFamily =
    "var(--font-montserrat), Montserrat, sans-serif" as const;

  return (
    <section
      aria-labelledby="awards-title"
      className="flex w-full max-w-[1224px] flex-col gap-20"
    >
      {/* mms_C1_Header */}
      <header className="flex w-full flex-col gap-4">
        <p
          className="text-2xl font-bold leading-8 text-saa-text-primary"
          style={{ fontFamily }}
        >
          {caption}
        </p>
        <hr className="h-px w-full border-0 bg-saa-divider" />
        <h2
          id="awards-title"
          className="text-[57px] font-bold leading-[64px] tracking-[-0.25px] text-saa-cta-bg"
          style={{ fontFamily }}
        >
          {title}
        </h2>
      </header>

      {/* mms_C2_Award list — 2 rows × 3 cols */}
      <div className="grid grid-cols-1 gap-x-20 gap-y-20 sm:grid-cols-2 lg:grid-cols-3">
        {AWARD_CATALOG.map((category) => (
          <AwardCard
            key={category.slug}
            category={category}
            description={
              locale === "en" ? category.descriptionEn : category.description
            }
            detailLabel={detailLabel}
          />
        ))}
      </div>
    </section>
  );
}
