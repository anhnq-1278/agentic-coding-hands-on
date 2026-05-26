import Image from "next/image";

type Props = {
  title: string;
};

/**
 * `A_KV Kudos` (`2940:13437`) — text-only keyvisual block.
 *
 * Layout per Figma:
 *   - "Hệ thống ghi nhận và cảm ơn" (36px Montserrat 700, yellow `#FFEA9E`,
 *     left-aligned).
 *   - SAA 2025 KUDOS logo (593×104) below, left-aligned.
 *
 * No hero background — the block sits directly on the page background.
 */
export function KudosKeyvisual({ title }: Props) {
  return (
    <div
      className="flex w-full flex-col gap-3"
      style={{
        fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
      }}
    >
      <h1 className="text-3xl font-bold leading-tight tracking-tight text-saa-cta-bg lg:text-4xl">
        {title}
      </h1>
      <Image
        src="/assets/sun-kudos/images/kudos-logo.svg"
        alt="SAA 2025 KUDOS"
        width={593}
        height={104}
        priority
        className="h-auto w-full max-w-[593px] select-none"
      />
    </div>
  );
}
