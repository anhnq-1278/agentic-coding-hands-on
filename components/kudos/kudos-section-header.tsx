import type { ReactNode } from "react";

type Props = {
  caption: string;
  title: string;
  /** Optional right-side controls (filters, etc.). Aligns to the right of
   *  the title via `justify-content: space-between`. */
  rightSlot?: ReactNode;
};

/**
 * Shared section header used by HIGHLIGHT KUDOS / SPOTLIGHT BOARD / ALL
 * KUDOS sections. Mirrors Figma `B.1_header` (`2940:13452`) and siblings:
 *
 *   - Caption "Sun* Annual Awards 2025" (24px Montserrat 700 white, left).
 *   - Rectangle 26 — 1px `#2E3940` divider spanning the full row.
 *   - Frame 488 — 64px-tall row with the section title (57px Montserrat 700
 *     yellow) and optional right-aligned controls.
 */
export function KudosSectionHeader({ caption, title, rightSlot }: Props) {
  return (
    <header
      className="flex w-full flex-col gap-4"
      style={{
        fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
      }}
    >
      <p className="text-2xl font-bold leading-8 text-saa-text-primary">
        {caption}
      </p>
      {/* Rectangle 26 — explicit color so it's visible against any local
          backdrop (radial gradients / cards behind). */}
      <div
        aria-hidden
        className="h-px w-full"
        style={{ backgroundColor: "#2E3940" }}
      />
      <div className="flex w-full flex-wrap items-center justify-between gap-4">
        <h2 className="text-4xl font-bold leading-tight tracking-[-0.25px] text-saa-cta-bg lg:text-[57px] lg:leading-16">
          {title}
        </h2>
        {rightSlot && <div className="flex items-center">{rightSlot}</div>}
      </div>
    </header>
  );
}
