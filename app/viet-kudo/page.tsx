import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { VietKudoPage } from "@/components/kudos/viet-kudo-page";
import { isAdminEmail } from "@/lib/auth/admin-roles";
import { getCurrentUser } from "@/lib/auth/session";
import { getLocale } from "@/lib/i18n/get-locale";
import {
  getHomepageDictionary,
  getKudosDialogDictionary,
} from "@/lib/i18n/dictionary";
import {
  getViewerId,
  listSunnerDirectory,
} from "@/lib/kudos/service";

export const metadata: Metadata = {
  title: "Viết Kudo — Gửi lời cám ơn và ghi nhận đến đồng đội",
  description:
    "Soạn và gửi Kudos đến đồng đội — chọn người nhận, viết lời cám ơn, gắn hashtag.",
};

type PageProps = {
  searchParams: Promise<{ recipient?: string }>;
};

export default async function VietKudoRoute({ searchParams }: PageProps) {
  const [user, locale, sp] = await Promise.all([
    getCurrentUser(),
    getLocale(),
    searchParams,
  ]);

  if (!user) {
    redirect("/login");
  }

  const dialog = getKudosDialogDictionary(locale);
  const homepage = getHomepageDictionary(locale);
  const isAdmin = isAdminEmail(user.email);
  const viewerId = getViewerId(user.email);

  // Resolve `?recipient={id}` against the Sunner directory; ignore if
  // the id doesn't exist (per spec FR-014).
  let initialRecipient: { id: string; displayName: string } | undefined;
  if (sp.recipient) {
    const directory = listSunnerDirectory();
    const sunner = directory[sp.recipient];
    if (sunner && sunner.id !== viewerId) {
      initialRecipient = { id: sunner.id, displayName: sunner.displayName };
    }
  }

  return (
    <VietKudoPage
      locale={locale}
      isAuthenticated
      isAdmin={isAdmin}
      userDisplay={user.displayName ?? user.email}
      unreadCount={0}
      viewerId={viewerId}
      initialRecipient={initialRecipient}
      composerCopy={dialog}
      copyright={homepage.copyright}
      accountCopy={homepage.account}
      footerLinkLabels={homepage.footerLinks}
    />
  );
}
