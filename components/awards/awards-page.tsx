import type { Locale } from "@/types/auth";
import { AppHeader } from "@/components/layout/app-header";
import { AppFooter } from "@/components/layout/app-footer";
import { SunKudosBlock } from "@/components/homepage/sun-kudos-block";
import { AwardsKeyvisual } from "@/components/awards/awards-keyvisual";
import { AwardsTitle } from "@/components/awards/awards-title";
import { AwardsSideMenu } from "@/components/awards/awards-side-menu";
import { AwardInfoBlock } from "@/components/awards/award-info-block";
import { AWARD_CATALOG } from "@/lib/awards/catalog";

type Props = {
  locale: Locale;
  isAuthenticated: boolean;
  isAdmin: boolean;
  userDisplay: string | null;
  unreadCount: number;
  awards: {
    caption: string;
    heading: string;
    countLabel: string;
    valueLabel: string;
    perPrizeSuffix: string;
    orLabel: string;
  };
  kudosBlockCopy: {
    label: string;
    eyebrow: string;
    body: string;
    cta: string;
  };
  copyright: string;
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

/**
 * Composes the full Awards Information layout:
 *   AppHeader → keyvisual cover → title block → two-column body
 *   (sticky side menu + stacked award sections) → Sun* Kudos promo →
 *   AppFooter.
 */
export function AwardsPage({
  locale,
  isAuthenticated,
  isAdmin,
  userDisplay,
  unreadCount,
  awards,
  kudosBlockCopy,
  copyright,
  accountCopy,
  footerLinkLabels,
}: Props) {
  // No overflow-hidden on the root: `position: sticky` on the side menu
  // requires that no ancestor between the sticky element and the viewport
  // introduces a new scroll/clip context.
  return (
    <div className="relative min-h-screen w-full bg-saa-bg text-saa-text-primary">
      <div className="relative z-10 flex min-h-screen flex-col">
        <AppHeader
          currentPath="/awards-information"
          locale={locale}
          isAuthenticated={isAuthenticated}
          isAdmin={isAdmin}
          userDisplay={userDisplay}
          unreadCount={unreadCount}
          accountCopy={accountCopy}
        />

        <AwardsKeyvisual />

        <main className="flex flex-1 flex-col items-center gap-20 px-36 pb-30">
          <div className="flex w-full max-w-[1224px] flex-col gap-12">
            <AwardsTitle caption={awards.caption} heading={awards.heading} />

            {/* Two-column body: sticky side menu + stacked award sections.
                `lg:self-start` is REQUIRED — without it the flex parent
                stretches the aside to fill the column's full height and
                `sticky` has nothing to stick against. */}
            <div className="flex w-full flex-col items-stretch gap-12 lg:flex-row lg:gap-20">
              <aside className="lg:sticky lg:top-32 lg:h-fit lg:w-44.5 lg:shrink-0 lg:self-start">
                <AwardsSideMenu />
              </aside>

              <div className="flex flex-1 flex-col gap-20">
                {AWARD_CATALOG.map((category, index) => (
                  <AwardInfoBlock
                    key={category.slug}
                    category={category}
                    longDescription={
                      locale === "en"
                        ? category.longDescriptionEn
                        : category.longDescription
                    }
                    countLabel={awards.countLabel}
                    valueLabel={awards.valueLabel}
                    perPrizeSuffix={awards.perPrizeSuffix}
                    orLabel={awards.orLabel}
                    index={index}
                    showBottomDivider={index < AWARD_CATALOG.length - 1}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex w-full justify-center pt-12">
            <SunKudosBlock copy={kudosBlockCopy} />
          </div>
        </main>

        <AppFooter
          currentPath="/awards-information"
          copyright={copyright}
          linkLabels={footerLinkLabels}
        />
      </div>
    </div>
  );
}
