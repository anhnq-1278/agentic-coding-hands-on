import Image from "next/image";
import type { AwardCategory } from "@/lib/awards/catalog";
import { getAwardsSectionId } from "@/components/awards/awards-section-id";

type Props = {
  category: AwardCategory;
  /** Long-form description resolved by the caller from the current locale. */
  longDescription: string;
  countLabel: string;
  valueLabel: string;
  /** Default per-prize suffix from the dictionary. Per-value overrides on
   *  the category (Signature 2025) take precedence. */
  perPrizeSuffix: string;
  /** Disjunction label rendered between Signature 2025's dual-value cards. */
  orLabel: string;
  /** Index in the catalog (0-5). Even renders image-left; odd image-right. */
  index: number;
  /** When false, suppress the bottom Rectangle 14 between-award divider
   *  (used on the last item). */
  showBottomDivider: boolean;
};

const TARGET_ICON_SRC = "/assets/awards-information/icons/target.svg";
const DIAMOND_ICON_SRC = "/assets/awards-information/icons/diamond.svg";
const LICENSE_ICON_SRC = "/assets/awards-information/icons/license.svg";

const FONT_FAMILY =
  "var(--font-montserrat), Montserrat, sans-serif" as const;

/**
 * One value card (License icon + label / amount / suffix). Used once for the
 * standard single-value layout and twice (with `Hoặc` between) for Signature
 * 2025 - Creator.
 */
function ValueCard({
  valueLabel,
  amount,
  suffix,
}: {
  valueLabel: string;
  amount: string;
  suffix: string;
}) {
  return (
    <div className="flex flex-col gap-4" style={{ fontFamily: FONT_FAMILY }}>
      <div className="flex items-center gap-4">
        <Image
          src={LICENSE_ICON_SRC}
          alt=""
          width={24}
          height={24}
          className="h-6 w-6 shrink-0"
        />
        <span className="text-2xl font-bold leading-8 text-saa-cta-bg">
          {valueLabel}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-4xl font-bold leading-11 text-saa-text-primary">
          {amount}
        </span>
        <span className="text-sm font-bold leading-5 tracking-[0.1px] text-saa-text-primary">
          {suffix}
        </span>
      </div>
    </div>
  );
}

/**
 * One award section on the Awards Information page (`D.1`–`D.6`).
 * Mirrors Figma frame `D.1_Top talent` (313:8467) — and Signature 2025
 * (313:8471) for the dual-value variant:
 *
 *   Frame 506 [picture 336×336 | D.1.2_Content]
 *     ├─ content: title row (Target + 24px yellow) + 16px white description
 *     ├─ Rectangle 8 — 480×1 #2E3940 divider
 *     ├─ count row: Diamond + label + nested [count 36px white, unit 14px white]
 *     ├─ Rectangle 10 — 480×1 #2E3940 divider
 *     ├─ value card (License + label / amount 36px white / suffix 14px white)
 *     ├─ if dual-value (Signature only): Frame 524 — "Hoặc" + 434×1 divider
 *     └─ if dual-value: second value card
 *   Rectangle 14 — 853×1 #2E3940 between-award divider (when not last).
 *
 * Even indexes render image-left; odd indexes flip to image-right.
 */
export function AwardInfoBlock({
  category,
  longDescription,
  countLabel,
  valueLabel,
  perPrizeSuffix,
  orLabel,
  index,
  showBottomDivider,
}: Props) {
  const imageOnLeft = index % 2 === 0;
  const id = getAwardsSectionId(category.slug);
  const primarySuffix = category.valuePrimarySuffix ?? perPrizeSuffix;
  const hasSecondary = Boolean(category.valueSecondary);

  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="flex w-full scroll-mt-32 flex-col gap-20"
    >
      <div
        className={`flex w-full flex-col gap-10 lg:flex-row lg:items-start lg:gap-10 ${
          imageOnLeft ? "" : "lg:flex-row-reverse"
        }`}
      >
        {/* D.1.1_Picture-Award — 336×336 composite (hero bg + label overlay) */}
        <div
          className="relative h-84 w-84 shrink-0 overflow-hidden rounded-md"
          style={{
            boxShadow:
              "0 4px 4px 0 rgba(0, 0, 0, 0.25), 0 0 6px 0 var(--color-saa-glow)",
          }}
        >
          <Image
            src={category.heroImageSrc}
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
        </div>

        {/* D.1.2_Content — title+desc / divider / count / divider / value(s) */}
        <div className="flex flex-1 flex-col gap-8">
          {/* Title + description */}
          <div className="flex flex-col gap-6">
            <h2
              id={`${id}-title`}
              className="flex items-center gap-4 text-2xl font-bold leading-8 text-saa-cta-bg"
              style={{ fontFamily: FONT_FAMILY }}
            >
              <Image
                src={TARGET_ICON_SRC}
                alt=""
                width={24}
                height={24}
                className="h-6 w-6"
              />
              {category.title}
            </h2>
            <p
              className="text-base font-bold leading-6 tracking-[0.5px] text-saa-text-primary"
              style={{ fontFamily: FONT_FAMILY, textAlign: "justify" }}
            >
              {longDescription}
            </p>
          </div>

          {/* Rectangle 8 — internal divider */}
          <hr className="h-px w-full border-0 bg-saa-divider" />

          {/* Count line — matches Figma Frame 443 + nested "Số lượng" frame:
              [Diamond] [label 24px yellow] [count 36px white, unit 14px white] */}
          <div
            className="flex items-center gap-4"
            style={{ fontFamily: FONT_FAMILY }}
          >
            <Image
              src={DIAMOND_ICON_SRC}
              alt=""
              width={24}
              height={24}
              className="h-6 w-6 shrink-0"
            />
            <span className="text-2xl font-bold leading-8 whitespace-nowrap text-saa-cta-bg">
              {countLabel}
            </span>
            {/* "Số lượng" inner frame — items-center, gap-2 (8px). When
                `countUnit` is an array, each entry stacks vertically (matches
                Figma 313:8488 where "Cá nhân hoặc tập thể" wraps to 3 lines). */}
            <div className="flex items-center gap-2">
              <span className="text-4xl font-bold leading-11 text-saa-text-primary">
                {String(category.count).padStart(2, "0")}
              </span>
              {Array.isArray(category.countUnit) ? (
                <span className="flex flex-col text-sm font-bold leading-5 tracking-[0.1px] text-saa-text-primary">
                  {category.countUnit.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </span>
              ) : (
                <span className="text-sm font-bold leading-5 tracking-[0.1px] text-saa-text-primary">
                  {category.countUnit}
                </span>
              )}
            </div>
          </div>

          {/* Rectangle 10 — internal divider */}
          <hr className="h-px w-full border-0 bg-saa-divider" />

          {/* Value section — single ValueCard, or dual cards with "Hoặc" */}
          <ValueCard
            valueLabel={valueLabel}
            amount={category.valuePrimary}
            suffix={primarySuffix}
          />

          {hasSecondary && (
            <>
              {/* Frame 524 — "Hoặc" + Rectangle 11 divider */}
              <div
                className="flex items-center justify-center gap-2"
                style={{ fontFamily: FONT_FAMILY }}
              >
                <span className="text-sm font-bold leading-5 tracking-[0.1px] text-saa-divider">
                  {orLabel}
                </span>
                <span
                  aria-hidden
                  className="h-px flex-1 bg-saa-divider"
                />
              </div>

              <ValueCard
                valueLabel={valueLabel}
                amount={category.valueSecondary!}
                suffix={category.valueSecondarySuffix ?? perPrizeSuffix}
              />
            </>
          )}
        </div>
      </div>

      {/* Rectangle 14 — between-award divider (omit on last) */}
      {showBottomDivider && (
        <hr className="h-px w-full border-0 bg-saa-divider" />
      )}
    </section>
  );
}
