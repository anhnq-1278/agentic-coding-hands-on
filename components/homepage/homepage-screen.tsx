import Image from "next/image";
import type { Locale } from "@/types/auth";
import { AppHeader } from "@/components/layout/app-header";
import { AppFooter } from "@/components/layout/app-footer";
import { HomepageHero } from "@/components/homepage/homepage-hero";
import { RootFurtherSection } from "@/components/homepage/root-further-section";
import { AwardsSection } from "@/components/homepage/awards-section";
import { SunKudosBlock } from "@/components/homepage/sun-kudos-block";
import { FloatingWidget } from "@/components/homepage/floating-widget";

type Props = {
  locale: Locale;
  isAuthenticated: boolean;
  isAdmin: boolean;
  userDisplay: string | null;
  unreadCount: number;
  eventStartAt: number;
  eventMalformed: boolean;
  copy: {
    comingSoon: string;
    days: string;
    hours: string;
    minutes: string;
    timeLabel: string;
    timeValue: string;
    locationLabel: string;
    locationValue: string;
    livestreamNote: string;
    aboutAwards: string;
    aboutKudos: string;
    awardsCaption: string;
    awardsTitle: string;
    awardsDetailLabel: string;
    copyright: string;
  };
  kudosBlockCopy: {
    label: string;
    eyebrow: string;
    body: string;
    cta: string;
  };
  rootFurtherCopy: {
    intro: string;
    quote: string;
    quoteGloss: string;
    conclusion: string;
  };
  accountCopy: {
    profile: string;
    signOut: string;
    adminDashboard: string;
  };
  footerLinkLabels: {
    aboutSAA: string;
    awardInformation: string;
    sunKudos: string;
    communityStandards: string;
  };
};

export function HomepageScreen({
  locale,
  isAuthenticated,
  isAdmin,
  userDisplay,
  unreadCount,
  eventStartAt,
  eventMalformed,
  copy,
  kudosBlockCopy,
  rootFurtherCopy,
  accountCopy,
  footerLinkLabels,
}: Props) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-saa-bg text-saa-text-primary">
      {/* Cosmic keyvisual + bottom-up dark fade. Wrapped in a relative
          container with the source's intrinsic `aspect-[1512/1392]` so both
          the image AND the gradient overlay scale together with viewport
          width — at 1920px viewport the container becomes ~1768px tall and
          the gradient continues all the way to the bottom edge of the
          image, preventing the visible band that appeared when the fade
          was pinned to a fixed 1392px height. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-0 w-full aspect-[1512/1392]"
      >
        <Image
          src="/assets/homepage-saa/images/keyvisual-bg.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="select-none object-cover object-top"
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0, 16, 26, 0) 50%, #00101A 100%)",
          }}
        />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <AppHeader
          currentPath="/"
          locale={locale}
          isAuthenticated={isAuthenticated}
          isAdmin={isAdmin}
          userDisplay={userDisplay}
          unreadCount={unreadCount}
          accountCopy={accountCopy}
        />

        <main className="flex flex-1 flex-col items-center gap-30 px-36 pb-30">
          <HomepageHero
            eventStartAt={eventStartAt}
            eventMalformed={eventMalformed}
            copy={copy}
          />

          <RootFurtherSection copy={rootFurtherCopy} />

          <AwardsSection
            locale={locale}
            caption={copy.awardsCaption}
            title={copy.awardsTitle}
            detailLabel={copy.awardsDetailLabel}
          />

          <SunKudosBlock copy={kudosBlockCopy} />
        </main>

        <AppFooter
          currentPath="/"
          copyright={copy.copyright}
          linkLabels={footerLinkLabels}
        />
      </div>

      <FloatingWidget />
    </div>
  );
}
