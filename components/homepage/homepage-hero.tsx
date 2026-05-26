import Image from "next/image";
import { EventCountdown } from "@/components/homepage/event-countdown";
import { EventInfo } from "@/components/homepage/event-info";
import { HomepageCtaPair } from "@/components/homepage/homepage-cta-pair";

type Props = {
  eventStartAt: number;
  eventMalformed?: boolean;
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
  };
};

/**
 * Frame 487 — hero block on top of the keyvisual artwork.
 * Stacks: Root Further hero PNG → countdown + event info → CTA pair.
 */
export function HomepageHero({ eventStartAt, eventMalformed = false, copy }: Props) {
  return (
    <section
      aria-labelledby="hero-title"
      className="flex w-full max-w-[1224px] flex-col gap-10 pt-[184px]"
    >
      {/* Frame 482 — Root Further keyvisual logo */}
      <div className="flex h-[200px] w-full items-start">
        <Image
          src="/assets/login/images/root-further-logo.png"
          alt="Root Further — SAA 2025"
          width={451}
          height={200}
          priority
          className="h-[200px] w-[451px] select-none"
        />
        <h1 id="hero-title" className="sr-only">
          ROOT FURTHER — Sun Annual Awards 2025
        </h1>
      </div>

      {/* Frame 523 — countdown + event info */}
      <div className="flex w-full flex-col gap-4">
        <EventCountdown
          eventStartAt={eventStartAt}
          eventMalformed={eventMalformed}
          comingSoonLabel={copy.comingSoon}
          daysLabel={copy.days}
          hoursLabel={copy.hours}
          minutesLabel={copy.minutes}
        />
        <EventInfo
          timeLabel={copy.timeLabel}
          timeValue={copy.timeValue}
          locationLabel={copy.locationLabel}
          locationValue={copy.locationValue}
          livestreamNote={copy.livestreamNote}
        />
      </div>

      {/* mms_B3_Call-To-Action */}
      <HomepageCtaPair
        aboutAwardsLabel={copy.aboutAwards}
        aboutKudosLabel={copy.aboutKudos}
      />
    </section>
  );
}
