import Image from "next/image";
import Link from "next/link";

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
  copy: {
    label: string;
    eyebrow: string;
    body: string;
    cta: string;
  };
};

/**
 * mms_D1_Sunkudos — promo block.
 * Layout: 1120×500, dark backdrop with rounded corners, content on the left,
 * Sun* Kudos branded logo on the right.
 */
export function SunKudosBlock({ copy }: Props) {
  const fontFamily =
    "var(--font-montserrat), Montserrat, sans-serif" as const;

  return (
    <section
      aria-labelledby="kudos-title"
      className="relative h-[500px] w-full max-w-[1120px] overflow-hidden rounded-2xl bg-[#0F0F0F]"
    >
      {/* MM_MEDIA_Kudos Background */}
      <Image
        src="/assets/homepage-saa/images/kudos-bg.png"
        alt=""
        fill
        sizes="(max-width: 1120px) 100vw, 1120px"
        className="object-cover opacity-60"
      />

      {/* Two-column flex: content left, KUDOS logo right */}
      <div className="relative z-10 flex h-full">
        {/* mms_D2_Content (left) */}
        <div className="flex w-[457px] flex-shrink-0 flex-col justify-center gap-8 pl-[64px]">
          <div className="flex flex-col gap-4">
            <p
              className="text-2xl font-bold leading-8 text-saa-text-primary"
              style={{ fontFamily }}
            >
              {copy.label}
            </p>
            <h2
              id="kudos-title"
              className="text-[57px] font-bold leading-[64px] tracking-[-0.25px] text-saa-cta-bg"
              style={{ fontFamily }}
            >
              Sun* Kudos
            </h2>
            <p
              className="text-base font-bold leading-6 tracking-[0.5px] text-saa-text-primary"
              style={{ fontFamily, textAlign: "justify" }}
            >
              <span className="block">{copy.eyebrow}</span>
              {copy.body}
            </p>
          </div>

          {/* Frame 495 — CTA */}
          <Link
            href="/sun-kudos"
            className="flex h-14 w-fit items-center gap-2 rounded-[4px] bg-saa-cta-bg px-4 py-4 text-saa-cta-text shadow-sm transition-shadow duration-150 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40"
          >
            <span
              className="text-base font-bold leading-6 tracking-[0.15px]"
              style={{ fontFamily }}
            >
              {copy.cta}
            </span>
            <span className="h-6 w-6 text-saa-cta-text">{ARROW_UP_RIGHT}</span>
          </Link>
        </div>

        {/* MM_MEDIA_Logo/Kudos (right column) */}
        <div className="flex flex-1 items-center justify-center pr-[64px]">
          <Image
            src="/assets/homepage-saa/logos/kudos-logo.svg"
            alt="Sun* Kudos"
            width={364}
            height={72}
            className="h-auto w-[364px] max-w-full select-none"
          />
        </div>
      </div>
    </section>
  );
}
