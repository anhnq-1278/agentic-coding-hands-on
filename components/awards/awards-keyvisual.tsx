import Image from "next/image";

/**
 * Frame `3_Keyvisual` (`313:8437`) — cover banner at the top of the
 * Awards Information page. Layered:
 *   1. Full-bleed cosmic background (shared with Login + Homepage hero).
 *   2. Bottom-up dark fade so the band blends into the awards body below.
 *   3. Centered "Root Further" text PNG (page-specific 338×150 asset).
 */
export function AwardsKeyvisual() {
  return (
    <div className="relative h-[400px] w-full overflow-hidden bg-saa-bg lg:h-[480px]">
      {/* Full-bleed background art (reuses Login/Homepage keyvisual) */}
      <Image
        src="/assets/login/images/keyvisual-bg.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="pointer-events-none select-none object-cover"
      />
      {/* Bottom-up dark fade for legibility */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(180deg, rgba(0, 16, 26, 0.30) 0%, rgba(0, 16, 26, 0.55) 60%, #00101A 100%)",
        }}
      />
      {/* Root Further text — left-aligned within content max-width (matches
          Figma `Frame 482` 313:8451 with align-items: flex-start). */}
      <div className="absolute inset-0 z-2 flex items-center px-36">
        <Image
          src="/assets/awards-information/images/root-further-text.png"
          alt="Keyvisual Sun* Annual Award 2025"
          width={338}
          height={150}
          priority
          className="select-none"
        />
      </div>
    </div>
  );
}
