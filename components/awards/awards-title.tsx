type Props = {
  caption: string;
  heading: string;
};

/**
 * Frame `A_Title hệ thống giải thưởng` (`313:8453`) — caption + heading
 * block at the top of the awards body.
 */
export function AwardsTitle({ caption, heading }: Props) {
  const fontFamily =
    "var(--font-montserrat), Montserrat, sans-serif" as const;

  return (
    <header className="flex w-full flex-col gap-4">
      <p
        className="w-full text-center text-2xl font-bold leading-8 text-saa-text-primary"
        style={{ fontFamily }}
      >
        {caption}
      </p>
      <hr className="h-px w-full border-0 bg-saa-divider" />
      {/* Frame 488 (313:8456) — justify-content: center row containing the
          heading. Heading is intrinsic-width with `whitespace-nowrap` so it
          stays on a single line, then the flex row centers it. Figma's 931px
          is the auto-resized rendered width of the text, not a forced max. */}
      <div className="flex w-full justify-center">
        <h1
          className="text-left text-5xl font-bold leading-16 tracking-[-0.25px] whitespace-nowrap text-saa-cta-bg lg:text-[57px]"
          style={{ fontFamily }}
        >
          {heading}
        </h1>
      </div>
    </header>
  );
}
