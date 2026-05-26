import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AwardsPage } from "@/components/awards/awards-page";
import { getCurrentUser } from "@/lib/auth/session";
import { getLocale } from "@/lib/i18n/get-locale";
import {
  getAwardsDictionary,
  getHomepageDictionary,
} from "@/lib/i18n/dictionary";
import { isAdminEmail } from "@/lib/auth/admin-roles";

export const metadata: Metadata = {
  title: "Hệ thống giải — Sun Annual Awards 2025",
  description:
    "Hệ thống các giải thưởng SAA 2025: Top Talent, Top Project, Top Project Leader, Best Manager, Signature 2025 - Creator, MVP.",
};

export default async function AwardsInformationPage() {
  const [user, locale] = await Promise.all([getCurrentUser(), getLocale()]);

  // Defence-in-depth: middleware already gates this route, but if it ever
  // gets bypassed (matcher misconfig) anonymous visitors land on /login.
  if (!user) {
    redirect("/login");
  }

  const awards = getAwardsDictionary(locale);
  // Reuse Homepage's dictionary for chrome strings (footer links, account
  // menu copy) since the Awards page renders the same chrome.
  const homepage = getHomepageDictionary(locale);
  const isAdmin = isAdminEmail(user.email);

  return (
    <AwardsPage
      locale={locale}
      isAuthenticated
      isAdmin={isAdmin}
      userDisplay={user.displayName ?? user.email}
      unreadCount={0}
      awards={{
        caption: awards.caption,
        heading: awards.heading,
        countLabel: awards.countLabel,
        valueLabel: awards.valueLabel,
        perPrizeSuffix: awards.perPrizeSuffix,
        orLabel: awards.orLabel,
      }}
      kudosBlockCopy={{
        label: homepage.sunKudos.label,
        eyebrow: homepage.sunKudos.eyebrow,
        body: homepage.sunKudos.body,
        cta: homepage.sunKudos.cta,
      }}
      copyright={homepage.copyright}
      accountCopy={homepage.account}
      footerLinkLabels={homepage.footerLinks}
    />
  );
}
