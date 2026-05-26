import Image from "next/image";
import { CountdownUnlock } from "@/components/countdown/countdown-unlock";

type Props = {
  eventStartAt: number;
  eventMalformed: boolean;
  subtitle: string;
  labels: { days: string; hours: string; minutes: string };
  malformedDigit: string;
};

const fontFamilyMontserrat =
  "var(--font-montserrat), Montserrat, sans-serif" as const;

/**
 * Countdown — Prelaunch page takeover (Figma frame `2268:35127`).
 * Layout: full-bleed background image + dark linear-gradient overlay + centered
 * subtitle + the live `<CountdownUnlock>` (3 units of two-digit glass tiles).
 *
 * NO chrome, NO clickable elements (per spec FR-008).
 */
export function CountdownTakeover({
  eventStartAt,
  eventMalformed,
  subtitle,
  labels,
  malformedDigit,
}: Props) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-saa-bg text-saa-text-primary">
      {/* MM_MEDIA_BG Image — full-bleed background */}
      <Image
        src="/assets/countdown-prelaunch-page/images/bg.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="pointer-events-none absolute inset-0 z-0 select-none object-cover"
      />

      {/* Cover — angled dark fade */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-1"
        style={{
          background:
            "linear-gradient(18deg, #00101A 15.48%, rgba(0, 18, 29, 0.46) 52.13%, rgba(0, 19, 32, 0.00) 63.41%)",
        }}
      />

      {/* Bìa — centered content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-36 py-24">
        <div className="flex w-full max-w-[1224px] flex-col items-center gap-30">
          <div className="flex w-full flex-col items-center gap-6">
            <p
              className="text-center text-[36px] font-bold leading-12 text-saa-text-primary"
              style={{ fontFamily: fontFamilyMontserrat }}
            >
              {subtitle}
            </p>

            <CountdownUnlock
              eventStartAt={eventStartAt}
              eventMalformed={eventMalformed}
              labels={labels}
              malformedDigit={malformedDigit}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
