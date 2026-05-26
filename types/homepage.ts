export type Event = {
  /** Epoch milliseconds for the event start time. */
  startAt: number;
  /** Original ISO-8601 source string (for display when needed). */
  startAtIso: string;
  /** Localized location string (e.g., "Âu Cơ Art Center"). */
  location: string;
  /** Localized note shown beneath the event-info pair. */
  livestreamNote: string;
  /** True when `EVENT_START_AT` was missing or unparseable; consumers SHOULD render fallback UI. */
  malformed: boolean;
};

export type NotificationSummary = {
  unreadCount: number;
};
