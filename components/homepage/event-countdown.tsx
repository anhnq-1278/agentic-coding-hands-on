"use client";

import { useEffect, useState } from "react";

type Props = {
  /** Epoch milliseconds for the event start (server-supplied). */
  eventStartAt: number;
  /** When true, render a `--` fallback for each tile (per spec edge case ID-60). */
  eventMalformed?: boolean;
  comingSoonLabel: string;
  daysLabel: string;
  hoursLabel: string;
  minutesLabel: string;
};

type Delta = { days: number; hours: number; minutes: number; reached: boolean };

function computeDelta(now: number, target: number): Delta {
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

function pad(n: number): string {
  return Number.isFinite(n) ? String(Math.max(0, Math.min(99, n))).padStart(2, "0") : "00";
}

export function EventCountdown({
  eventStartAt,
  eventMalformed = false,
  comingSoonLabel,
  daysLabel,
  hoursLabel,
  minutesLabel,
}: Props) {
  const [delta, setDelta] = useState<Delta>(() =>
    computeDelta(Date.now(), eventStartAt),
  );

  useEffect(() => {
    if (eventMalformed) return;
    const id = setInterval(() => {
      setDelta(computeDelta(Date.now(), eventStartAt));
    }, 60_000);
    return () => clearInterval(id);
  }, [eventStartAt, eventMalformed]);

  const showSubtitle = !eventMalformed && !delta.reached;
  const days = eventMalformed ? "--" : pad(delta.days);
  const hours = eventMalformed ? "--" : pad(delta.hours);
  const minutes = eventMalformed ? "--" : pad(delta.minutes);

  return (
    <div className="flex w-full flex-col gap-4">
      {showSubtitle && (
        <p
          className="text-2xl font-bold leading-8 text-saa-text-primary"
          style={{ fontFamily: "var(--font-montserrat), Montserrat, sans-serif" }}
        >
          {comingSoonLabel}
        </p>
      )}
      <div className="flex items-start gap-10">
        <CountdownTile value={days} label={daysLabel} />
        <CountdownTile value={hours} label={hoursLabel} />
        <CountdownTile value={minutes} label={minutesLabel} />
      </div>
    </div>
  );
}

function CountdownTile({ value, label }: { value: string; label: string }) {
  const fontFamily =
    "var(--font-montserrat), Montserrat, sans-serif" as const;

  return (
    <div className="flex w-[116px] flex-col items-start gap-3.5">
      <span
        className="flex h-[82px] w-full items-center text-[72px] font-bold leading-none tracking-tight text-saa-cta-bg"
        style={{
          fontFamily,
          textShadow:
            "0 4px 4px rgba(0, 0, 0, 0.25), 0 0 10px rgba(255, 234, 158, 0.35)",
        }}
      >
        {value}
      </span>
      <span
        className="text-2xl font-bold leading-8 text-saa-text-primary"
        style={{ fontFamily }}
      >
        {label}
      </span>
    </div>
  );
}
