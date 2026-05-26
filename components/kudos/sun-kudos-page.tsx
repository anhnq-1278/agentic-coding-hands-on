"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { ToastHost } from "@/components/feedback/toast-host";
import { AppFooter } from "@/components/layout/app-footer";
import { AppHeader } from "@/components/layout/app-header";
import { KudosAllList } from "@/components/kudos/kudos-all-list";
import type { ComposerCopy } from "@/components/kudos/kudos-composer";
import { KudosComposerModal } from "@/components/kudos/kudos-composer-modal";
import { KudosHighlightBand } from "@/components/kudos/kudos-highlight-band";
import { KudosInputRow } from "@/components/kudos/kudos-input-row";
import { KudosKeyvisual } from "@/components/kudos/kudos-keyvisual";
import { KudosSectionHeader } from "@/components/kudos/kudos-section-header";
import { KudosSidebar } from "@/components/kudos/kudos-sidebar";
import { KudosSpotlight } from "@/components/kudos/kudos-spotlight";
import { useKudosFilters } from "@/hooks/use-kudos-filters";
import type { KudosFilters } from "@/lib/kudos/types";
import type { Locale } from "@/types/auth";

type Props = {
  locale: Locale;
  isAuthenticated: boolean;
  isAdmin: boolean;
  userDisplay: string | null;
  unreadCount: number;
  viewerId: string;
  initialFilters: KudosFilters;
  /** Copy for the in-page Viết Kudo composer modal. */
  composerCopy: ComposerCopy;
  kudos: {
    keyvisualTitle: string;
    sendInputPlaceholder: string;
    sendInputAria: string;
    filterHashtagLabel: string;
    filterDepartmentLabel: string;
    filterClearLabel: string;
    highlightEyebrow: string;
    highlightTitle: string;
    allKudosEyebrow: string;
    allKudosTitle: string;
    spotlightEyebrow: string;
    spotlightTitle: string;
    spotlightCountLabel: string;
    spotlightSearchPlaceholder: string;
    spotlightSearchSubmitLabel: string;
    viewDetailsLabel: string;
    copyLinkLabel: string;
    copyLinkToast: string;
    heartLabel: string;
    emptyKudosMessage: string;
    emptyLeaderboardMessage: string;
    loadingLabel: string;
    noMoreLabel: string;
    secretBoxButtonLabel: string;
    secretBoxDisabledTooltip: string;
    panZoomLabel: string;
    panLabel: string;
    zoomLabel: string;
    sidebarReceivedLabel: string;
    sidebarSentLabel: string;
    sidebarHeartsLabel: string;
    sidebarSecretBoxesOpenedLabel: string;
    sidebarSecretBoxesPendingLabel: string;
    recentGiftsTitle: string;
    hashtagOverflowLabel: string;
    heartErrorMessage: string;
    anonymousDefaultName: string;
    searchMaxCharsError: string;
    searchRequiredError: string;
    carouselPagerLabel: string;
    carouselPrevLabel: string;
    carouselNextLabel: string;
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

export function SunKudosPage({
  locale,
  isAuthenticated,
  isAdmin,
  userDisplay,
  unreadCount,
  viewerId,
  initialFilters,
  composerCopy,
  kudos,
  copyright,
  accountCopy,
  footerLinkLabels,
}: Props) {
  const { filters, setHashtag, setDepartment } =
    useKudosFilters(initialFilters);
  const [composerOpen, setComposerOpen] = useState(false);

  const handleSelectHashtag = useCallback(
    (tag: string | null) => setHashtag(tag),
    [setHashtag],
  );

  const handleSelectDepartment = useCallback(
    (id: string | null) => setDepartment(id),
    [setDepartment],
  );

  const cardCopy = {
    heartLabel: kudos.heartLabel,
    copyLinkLabel: kudos.copyLinkLabel,
    copyLinkToast: kudos.copyLinkToast,
    viewDetailsLabel: kudos.viewDetailsLabel,
    heartErrorMessage: kudos.heartErrorMessage,
    hashtagOverflowLabel: kudos.hashtagOverflowLabel,
    anonymousDefaultName: kudos.anonymousDefaultName,
  };

  return (
    <ToastHost>
      <div className="relative min-h-screen w-full bg-saa-bg text-saa-text-primary">
        {/* Banner BG (Keyvisual instance 2940:13432) — full-bleed cosmic
            image at the top. Image + gradient share an aspect-ratio
            container (1440:440 from Figma) on lg+ so both scale together
            as the viewport widens: at 1920px the banner becomes ~587px
            tall instead of staying clamped to 440 and losing the bottom
            half of the cosmic art. Mobile keeps the fixed 420px height
            since the keyvisual hero text dominates that breakpoint. */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[420px] overflow-hidden lg:h-auto lg:aspect-[1440/440]">
          <Image
            src="/assets/sun-kudos/images/keyvisual-bg.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="select-none object-cover object-top"
          />
          {/* Bottom-up dark fade lives INSIDE the banner container so it
              scales with the image. By the time the fade reaches the
              bottom edge (#00101A 100%), the input row sits on a fully
              opaque page background regardless of viewport. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(0, 16, 26, 0.20) 0%, rgba(0, 16, 26, 0.50) 55%, #00101A 100%)",
            }}
          />
        </div>

        <div className="relative z-10 flex min-h-screen flex-col">
          <AppHeader
            currentPath="/sun-kudos"
            locale={locale}
            isAuthenticated={isAuthenticated}
            isAdmin={isAdmin}
            userDisplay={userDisplay}
            unreadCount={unreadCount}
            accountCopy={accountCopy}
          />

          <main className="flex flex-1 flex-col gap-16 px-6 pb-24 pt-26 lg:gap-20 lg:px-36 lg:pt-26">
            {/* A_KV Kudos — text + logo overlay on the banner image */}
            <KudosKeyvisual title={kudos.keyvisualTitle} />

            {/* Button chuc nang — Send pill + Search Sunner pill */}
            <KudosInputRow
              sendPlaceholder={kudos.sendInputPlaceholder}
              sendAria={kudos.sendInputAria}
              searchPlaceholder={kudos.spotlightSearchPlaceholder}
              searchAria={kudos.spotlightSearchSubmitLabel}
              onSendClick={() => setComposerOpen(true)}
            />

            {/* B_Highlight — 3-card filmstrip carousel */}
            <KudosHighlightBand
              filters={filters}
              viewerId={viewerId}
              copy={{
                eyebrow: kudos.highlightEyebrow,
                title: kudos.highlightTitle,
                heartLabel: kudos.heartLabel,
                copyLinkLabel: kudos.copyLinkLabel,
                copyLinkToast: kudos.copyLinkToast,
                viewDetailsLabel: kudos.viewDetailsLabel,
                heartErrorMessage: kudos.heartErrorMessage,
                hashtagOverflowLabel: kudos.hashtagOverflowLabel,
                anonymousDefaultName: kudos.anonymousDefaultName,
                emptyKudosMessage: kudos.emptyKudosMessage,
                loadingLabel: kudos.loadingLabel,
                pagerLabel: kudos.carouselPagerLabel,
                prevLabel: kudos.carouselPrevLabel,
                nextLabel: kudos.carouselNextLabel,
                filterHashtagLabel: kudos.filterHashtagLabel,
                filterDepartmentLabel: kudos.filterDepartmentLabel,
                filterClearLabel: kudos.filterClearLabel,
              }}
              onSelectHashtag={handleSelectHashtag}
              onSelectDepartment={handleSelectDepartment}
            />

            {/* B.6 + B.7 Spotlight */}
            <KudosSpotlight
              filters={filters}
              copy={{
                eyebrow: kudos.spotlightEyebrow,
                title: kudos.spotlightTitle,
                countLabel: kudos.spotlightCountLabel,
                searchPlaceholder: kudos.spotlightSearchPlaceholder,
                searchSubmitLabel: kudos.spotlightSearchSubmitLabel,
                searchMaxCharsError: kudos.searchMaxCharsError,
                searchRequiredError: kudos.searchRequiredError,
                panZoomLabel: kudos.panZoomLabel,
                panLabel: kudos.panLabel,
                zoomLabel: kudos.zoomLabel,
                emptyKudosMessage: kudos.emptyKudosMessage,
                loadingLabel: kudos.loadingLabel,
              }}
            />

            {/* C_All kudos — header + 2-column body (feed + sidebar) */}
            <section className="flex flex-col gap-10">
              <KudosSectionHeader
                caption={kudos.allKudosEyebrow}
                title={kudos.allKudosTitle}
              />
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_422px]">
                <KudosAllList
                  filters={filters}
                  viewerId={viewerId}
                  copy={{
                    ...cardCopy,
                    emptyKudosMessage: kudos.emptyKudosMessage,
                    loadingLabel: kudos.loadingLabel,
                    noMoreLabel: kudos.noMoreLabel,
                  }}
                  onSelectHashtag={(tag) => handleSelectHashtag(tag)}
                />

                <KudosSidebar
                  copy={{
                    receivedLabel: kudos.sidebarReceivedLabel,
                    sentLabel: kudos.sidebarSentLabel,
                    heartsLabel: kudos.sidebarHeartsLabel,
                    boxesOpenedLabel: kudos.sidebarSecretBoxesOpenedLabel,
                    boxesPendingLabel: kudos.sidebarSecretBoxesPendingLabel,
                    recentGiftsTitle: kudos.recentGiftsTitle,
                    emptyLeaderboardMessage: kudos.emptyLeaderboardMessage,
                    loadingLabel: kudos.loadingLabel,
                    secretBoxButtonLabel: kudos.secretBoxButtonLabel,
                    secretBoxDisabledTooltip:
                      kudos.secretBoxDisabledTooltip,
                  }}
                />
              </div>
            </section>
          </main>

          <AppFooter
            currentPath="/sun-kudos"
            copyright={copyright}
            linkLabels={footerLinkLabels}
          />
        </div>
      </div>
      <KudosComposerModal
        isOpen={composerOpen}
        viewerId={viewerId}
        copy={composerCopy}
        onClose={() => setComposerOpen(false)}
      />
    </ToastHost>
  );
}
