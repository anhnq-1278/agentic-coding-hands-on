import Image from "next/image";

type Props = {
  copy: {
    intro: string;
    quote: string;
    quoteGloss: string;
    conclusion: string;
  };
};

/**
 * Frame 486 — "Root Further" description block.
 * Sits between the hero and the awards section. Has a stacked typographic
 * "ROOT / FURTHER" header (PNG text labels) followed by three localized text
 * blocks (intro paragraph, English quote with VN gloss, conclusion).
 */
export function RootFurtherSection({ copy }: Props) {
  const fontFamily =
    "var(--font-montserrat), Montserrat, sans-serif" as const;

  return (
    <section
      aria-label="Root Further"
      className="flex w-full max-w-[1152px] flex-col items-center gap-8 rounded-lg px-[104px] py-[120px]"
    >
      {/* Group 434 — stacked ROOT / FURTHER text labels */}
      <div className="flex w-[290px] flex-col items-center">
        <Image
          src="/assets/homepage-saa/images/root-text.png"
          alt=""
          width={189}
          height={67}
          className="select-none"
        />
        <Image
          src="/assets/homepage-saa/images/further-text.png"
          alt=""
          width={290}
          height={67}
          className="select-none"
        />
        <span className="sr-only">Root Further</span>
      </div>

      {/* mms_B4_content — three text blocks */}
      <div className="flex w-full flex-col gap-8">
        <p
          className="text-2xl font-bold leading-8 text-saa-text-primary"
          style={{ fontFamily, textAlign: "justify" }}
        >
          {copy.intro}
        </p>

        <p
          className="text-center text-xl font-bold leading-8 text-saa-text-primary"
          style={{ fontFamily }}
        >
          {copy.quote}
          <br />
          {copy.quoteGloss}
        </p>

        <p
          className="text-2xl font-bold leading-8 text-saa-text-primary"
          style={{ fontFamily, textAlign: "justify" }}
        >
          {copy.conclusion}
        </p>
      </div>
    </section>
  );
}
