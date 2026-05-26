import type { Metadata } from "next";
import { CountdownTakeover } from "@/components/countdown/countdown-takeover";
import { getEvent } from "@/lib/events/get-event";
import { getLocale } from "@/lib/i18n/get-locale";
import { getCountdownDictionary } from "@/lib/i18n/dictionary";

export const metadata: Metadata = {
  title: "Sự kiện sẽ bắt đầu sau — SAA 2025",
  description: "Sun Annual Awards 2025 — pre-launch countdown.",
  robots: { index: false, follow: false },
};

export default async function CountdownPage() {
  const [locale, event] = await Promise.all([
    getLocale(),
    Promise.resolve(getEvent()),
  ]);
  const dictionary = getCountdownDictionary(locale);

  return (
    <CountdownTakeover
      eventStartAt={event.startAt}
      eventMalformed={event.malformed}
      subtitle={dictionary.subtitle}
      labels={{
        days: dictionary.daysLabel,
        hours: dictionary.hoursLabel,
        minutes: dictionary.minutesLabel,
      }}
      malformedDigit={dictionary.malformedDigit}
    />
  );
}
