import { getCurrentUser } from "@/lib/auth/session";
import { getLocale } from "@/lib/i18n/get-locale";
import { getHomepageDictionary } from "@/lib/i18n/dictionary";
import { getEvent, formatEventDate } from "@/lib/events/get-event";
import { isAdminEmail } from "@/lib/auth/admin-roles";
import { HomepageScreen } from "@/components/homepage/homepage-screen";

/**
 * Homepage SAA. Public per the plan — unauthenticated visitors see the page
 * with no bell / avatar; authenticated visitors see the full chrome.
 */
export default async function HomePage() {
  const [user, locale] = await Promise.all([getCurrentUser(), getLocale()]);
  const dictionary = getHomepageDictionary(locale);
  const event = getEvent();
  const isAuthenticated = user !== null;
  const isAdmin = isAdminEmail(user?.email);

  return (
    <HomepageScreen
      locale={locale}
      isAuthenticated={isAuthenticated}
      isAdmin={isAdmin}
      userDisplay={user?.displayName ?? user?.email ?? null}
      unreadCount={0}
      eventStartAt={event.startAt}
      eventMalformed={event.malformed}
      copy={{
        comingSoon: dictionary.comingSoon,
        days: dictionary.countdown.days,
        hours: dictionary.countdown.hours,
        minutes: dictionary.countdown.minutes,
        timeLabel: dictionary.eventInfo.timeLabel,
        timeValue: formatEventDate(event, locale),
        locationLabel: dictionary.eventInfo.locationLabel,
        locationValue: event.location,
        livestreamNote: event.livestreamNote,
        aboutAwards: dictionary.cta.aboutAwards,
        aboutKudos: dictionary.cta.aboutKudos,
        awardsCaption: dictionary.awards.caption,
        awardsTitle: dictionary.awards.title,
        awardsDetailLabel: dictionary.awards.detail,
        copyright: dictionary.copyright,
      }}
      kudosBlockCopy={{
        label: dictionary.sunKudos.label,
        eyebrow: dictionary.sunKudos.eyebrow,
        body: dictionary.sunKudos.body,
        cta: dictionary.sunKudos.cta,
      }}
      rootFurtherCopy={{
        intro: dictionary.rootFurther.intro,
        quote: dictionary.rootFurther.quote,
        quoteGloss: dictionary.rootFurther.quoteGloss,
        conclusion: dictionary.rootFurther.conclusion,
      }}
      accountCopy={dictionary.account}
      footerLinkLabels={dictionary.footerLinks}
    />
  );
}
