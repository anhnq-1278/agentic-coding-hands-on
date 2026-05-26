"use client";

import { useEffect, useRef, useState } from "react";

export type CountdownDelta = {
  days: number;
  hours: number;
  minutes: number;
  /** True once `now >= eventStartAt`. Stable after the first true transition. */
  reached: boolean;
};

type Options = {
  /** Epoch milliseconds for the event start (server-supplied). */
  eventStartAt: number;
  /** Pass true when `EVENT_START_AT` was missing/unparseable; the hook short-circuits and never ticks or fires `onComplete`. */
  eventMalformed?: boolean;
  /** Interval cadence in ms. Default 1000 ms for visual liveness; the rollover logic stays minute-accurate. */
  tickMs?: number;
  /** Called exactly once when `reached` transitions from false → true. */
  onComplete?: () => void;
};

function computeDelta(now: number, target: number): CountdownDelta {
  const ms = target - now;
  if (Number.isNaN(ms) || ms <= 0) {
    return { days: 0, hours: 0, minutes: 0, reached: true };
  }
  const totalMinutes = Math.floor(ms / 60_000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  return { days, hours, minutes, reached: false };
}

/**
 * Shared countdown tick hook. Both the Homepage hero's `<EventCountdown>` and
 * the Countdown takeover's `<CountdownUnlock>` consume this for tick + T-0
 * detection.
 */
export function useEventCountdown({
  eventStartAt,
  eventMalformed = false,
  tickMs = 1000,
  onComplete,
}: Options): CountdownDelta {
  const [delta, setDelta] = useState<CountdownDelta>(() =>
    eventMalformed
      ? { days: 0, hours: 0, minutes: 0, reached: false }
      : computeDelta(Date.now(), eventStartAt),
  );

  // Keep the latest `onComplete` reference without re-running the effect.
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Track whether we've already fired onComplete to keep firings exactly once.
  const firedRef = useRef(false);

  // If the initial delta is already reached, fire onComplete (once).
  useEffect(() => {
    if (!eventMalformed && delta.reached && !firedRef.current) {
      firedRef.current = true;
      onCompleteRef.current?.();
    }
  }, [eventMalformed, delta.reached]);

  useEffect(() => {
    if (eventMalformed) {
      return;
    }
    if (firedRef.current) {
      return;
    }

    const id = setInterval(() => {
      const next = computeDelta(Date.now(), eventStartAt);
      setDelta(next);
      if (next.reached && !firedRef.current) {
        firedRef.current = true;
        onCompleteRef.current?.();
        clearInterval(id);
      }
    }, tickMs);

    return () => clearInterval(id);
  }, [eventStartAt, eventMalformed, tickMs]);

  return delta;
}
