/**
 * Single digit card from Figma component `186:2619`. Glass-style 77×123 tile
 * with a subtle gradient fill, gold border, and a backdrop blur.
 *
 * Each unit (Days / Hours / Minutes) is two of these stacked side-by-side
 * with a 21px gap.
 */
type Props = {
  digit: string;
};

export function GlassDigit({ digit }: Props) {
  return (
    <span
      className="relative inline-flex h-[123px] w-[77px] items-center justify-center"
      aria-hidden
    >
      {/* Rectangle 1 — the glass card */}
      <span
        className="absolute inset-0 rounded-xl border-[0.75px] border-saa-cta-bg"
        style={{
          background:
            "linear-gradient(180deg, #FFFFFF 0%, rgba(255, 255, 255, 0.10) 100%)",
          backdropFilter: "blur(24.96px)",
          opacity: 0.5,
        }}
      />
      {/* The digit itself */}
      <span
        className="relative text-saa-text-primary"
        style={{
          fontFamily:
            "'Digital Numbers', var(--font-orbitron), 'Orbitron', 'Share Tech Mono', monospace",
          fontSize: "73.728px",
          fontWeight: 400,
          lineHeight: 1,
        }}
      >
        {digit}
      </span>
    </span>
  );
}
