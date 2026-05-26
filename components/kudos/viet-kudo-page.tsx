"use client";

import Image from "next/image";
import { ToastHost } from "@/components/feedback/toast-host";
import { AppFooter } from "@/components/layout/app-footer";
import { AppHeader } from "@/components/layout/app-header";
import {
  KudosComposer,
  type ComposerCopy,
} from "@/components/kudos/kudos-composer";
import type { RecipientSelection } from "@/hooks/use-kudos-composer";
import type { Locale } from "@/types/auth";

type Props = {
  locale: Locale;
  isAuthenticated: boolean;
  isAdmin: boolean;
  userDisplay: string | null;
  unreadCount: number;
  viewerId: string;
  initialRecipient?: RecipientSelection;
  composerCopy: ComposerCopy;
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
 * Standalone `/viet-kudo` page — same composer as the modal mode but
 * wrapped in the shared AppHeader / AppFooter chrome. Used when the
 * URL is opened directly (e.g. deep link with `?recipient={id}`).
 */
export function VietKudoPage({
  locale,
  isAuthenticated,
  isAdmin,
  userDisplay,
  unreadCount,
  viewerId,
  initialRecipient,
  composerCopy,
  copyright,
  accountCopy,
  footerLinkLabels,
}: Props) {
  return (
    <ToastHost>
      <div className="relative min-h-screen w-full bg-saa-bg text-saa-text-primary">
        {/* Cosmic keyvisual band — mirrors the `/sun-kudos` page's banner
            so deep-link visitors see the same backdrop as the live board.
            The image lives inside an aspect-ratio container so it scales
            proportionally with the viewport (no horizontal crop at
            1920+), and an internal top-to-bottom gradient fades it into
            the dark page background by the time the cream composer
            begins below. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[420px] overflow-hidden lg:h-auto lg:aspect-[1440/512]"
        >
          <Image
            src="/assets/sun-kudos/images/keyvisual-bg.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="select-none object-cover object-top"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(0, 16, 26, 0.30) 0%, rgba(0, 16, 26, 0.55) 55%, #00101A 100%)",
            }}
          />
        </div>
        <div className="relative z-10 flex min-h-screen flex-col">
          <AppHeader
            currentPath="/viet-kudo"
            locale={locale}
            isAuthenticated={isAuthenticated}
            isAdmin={isAdmin}
            userDisplay={userDisplay}
            unreadCount={unreadCount}
            accountCopy={accountCopy}
          />
          <main className="flex flex-1 items-start justify-center px-6 py-12 lg:py-20">
            <KudosComposer
              mode="standalone"
              viewerId={viewerId}
              initialRecipient={initialRecipient}
              copy={composerCopy}
            />
          </main>
          <AppFooter
            currentPath="/viet-kudo"
            copyright={copyright}
            linkLabels={footerLinkLabels}
          />
        </div>
      </div>
    </ToastHost>
  );
}
