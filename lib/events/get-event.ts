import type { Event } from "@/types/homepage";

const DEFAULT_LOCATION = "Âu Cơ Art Center";
const DEFAULT_LIVESTREAM_NOTE =
  "Tường thuật trực tiếp qua sóng Livestream";

/**
 * Server-only reader for the event configuration. Reads `EVENT_START_AT`
 * (ISO-8601), with optional `EVENT_LOCATION` and `EVENT_LIVESTREAM_NOTE`
 * overrides. On invalid/missing values, returns a `malformed: true` shape so
 * the UI can render a graceful fallback (per spec edge case ID-60).
 */
export function getEvent(): Event {
  const iso = process.env.EVENT_START_AT ?? "";
  const parsed = iso ? Date.parse(iso) : Number.NaN;

  if (!iso || !Number.isFinite(parsed)) {
    return {
      startAt: 0,
      startAtIso: "",
      location: process.env.EVENT_LOCATION ?? DEFAULT_LOCATION,
      livestreamNote:
        process.env.EVENT_LIVESTREAM_NOTE ?? DEFAULT_LIVESTREAM_NOTE,
      malformed: true,
    };
  }

  return {
    startAt: parsed,
    startAtIso: iso,
    location: process.env.EVENT_LOCATION ?? DEFAULT_LOCATION,
    livestreamNote:
      process.env.EVENT_LIVESTREAM_NOTE ?? DEFAULT_LIVESTREAM_NOTE,
    malformed: false,
  };
}

/**
 * True while `Date.now() < EVENT_START_AT`. **Fail-open**: a malformed env
 * value returns `false` so the prelaunch gate never locks the app on a config
 * mistake. Per the plan, operators can recover without a redeploy.
 */
export function isPrelaunch(now: number = Date.now()): boolean {
  const event = getEvent();
  if (event.malformed) {
    return false;
  }
  return now < event.startAt;
}

export function formatEventDate(event: Event, locale: "vi" | "en"): string {
  if (event.malformed) {
    return "—";
  }
  const date = new Date(event.startAt);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return locale === "vi" ? `${day}/${month}/${year}` : `${month}/${day}/${year}`;
}
