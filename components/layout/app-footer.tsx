import Image from "next/image";
import Link from "next/link";

type Props = {
  currentPath?: string;
  copyright: string;
  linkLabels: {
    aboutSAA: string;
    awardInformation: string;
    sunKudos: string;
    communityStandards: string;
  };
};

/**
 * mms_7_Footer — logo + 4 nav links + copyright.
 */
export function AppFooter({ currentPath = "/", copyright, linkLabels }: Props) {
  const fontFamily =
    "var(--font-montserrat), Montserrat, sans-serif" as const;

  const links = [
    { href: "/", label: linkLabels.aboutSAA },
    { href: "/awards-information", label: linkLabels.awardInformation },
    { href: "/sun-kudos", label: linkLabels.sunKudos },
    { href: "/community-standards", label: linkLabels.communityStandards },
  ];

  return (
    <footer className="flex w-full items-center justify-between border-t border-saa-divider px-22.5 py-10">
      <div className="flex h-16 items-center gap-20">
        <Link
          href="/"
          aria-label="Sun Annual Awards 2025 — go to homepage"
          className="flex h-16 w-[69px] items-center"
        >
          <Image
            src="/assets/homepage-saa/logos/footer-logo.png"
            alt="Sun Annual Awards 2025"
            width={69}
            height={64}
            className="h-16 w-[69px] select-none"
          />
        </Link>
        <nav aria-label="Footer" className="flex items-center gap-12">
          {links.map((item) => {
            const selected = currentPath === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={selected ? "page" : undefined}
                className={
                  selected
                    ? "flex items-center gap-1 rounded-sm p-4 text-saa-cta-bg"
                    : "flex items-center gap-1 rounded-sm p-4 text-saa-text-primary transition-colors hover:bg-white/5"
                }
                style={{
                  fontFamily,
                  background: selected
                    ? "rgba(255, 234, 158, 0.10)"
                    : undefined,
                }}
              >
                <span
                  className="text-base font-bold leading-6 tracking-[0.15px]"
                  style={
                    selected
                      ? {
                          textShadow:
                            "0 4px 4px rgba(0, 0, 0, 0.25), 0 0 6px var(--color-saa-glow)",
                        }
                      : undefined
                  }
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      <p
        className="text-base font-bold leading-6 text-saa-text-primary"
        style={{
          fontFamily:
            "var(--font-montserrat-alternates), 'Montserrat Alternates', Montserrat, sans-serif",
        }}
      >
        {copyright}
      </p>
    </footer>
  );
}
