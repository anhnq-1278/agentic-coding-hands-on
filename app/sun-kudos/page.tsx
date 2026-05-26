import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SunKudosPage } from "@/components/kudos/sun-kudos-page";
import { isAdminEmail } from "@/lib/auth/admin-roles";
import { getCurrentUser } from "@/lib/auth/session";
import { getLocale } from "@/lib/i18n/get-locale";
import {
  getHomepageDictionary,
  getKudosDialogDictionary,
  getKudosDictionary,
} from "@/lib/i18n/dictionary";
import { getViewerId } from "@/lib/kudos/service";

export const metadata: Metadata = {
  title: "Sun* Kudos — Hệ thống ghi nhận lời cảm ơn",
  description:
    "Sun* Kudos Live Board — phong trào ghi nhận lời cảm ơn của cộng đồng Sunner.",
};

type PageProps = {
  searchParams: Promise<{ hashtag?: string; department?: string }>;
};

export default async function SunKudosRoute({ searchParams }: PageProps) {
  const [user, locale, sp] = await Promise.all([
    getCurrentUser(),
    getLocale(),
    searchParams,
  ]);

  // Defence-in-depth: middleware already gates this route, but if it ever
  // gets bypassed (matcher misconfig) anonymous visitors land on /login.
  if (!user) {
    redirect("/login");
  }

  const kudos = getKudosDictionary(locale);
  const dialog = getKudosDialogDictionary(locale);
  const homepage = getHomepageDictionary(locale);
  const isAdmin = isAdminEmail(user.email);
  const viewerId = getViewerId(user.email);

  return (
    <SunKudosPage
      locale={locale}
      isAuthenticated
      isAdmin={isAdmin}
      userDisplay={user.displayName ?? user.email}
      unreadCount={0}
      viewerId={viewerId}
      initialFilters={{
        hashtag: sp.hashtag ?? null,
        departmentId: sp.department ?? null,
      }}
      composerCopy={dialog}
      kudos={kudos}
      copyright={homepage.copyright}
      accountCopy={homepage.account}
      footerLinkLabels={homepage.footerLinks}
    />
  );
}
