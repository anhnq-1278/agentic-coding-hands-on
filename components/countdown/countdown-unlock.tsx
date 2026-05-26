"use client";

import { useRouter } from "next/navigation";
import { useCallback, useRef } from "react";
import { useEventCountdown } from "@/hooks/use-event-countdown";
import { validateReturnTo } from "@/lib/auth/return-to";
import { GlassDigit } from "@/components/countdown/glass-digit";

type Props = {
  eventStartAt: number;
  eventMalformed?: boolean;
  labels: { days: string; hours: string; minutes: string };
  malformedDigit: string;
};

const RETURN_TO_COOKIE = "saa-returnTo";

function pad(value: number, malformed: boolean, fallbackDigit: string): string {
  if (malformed) {
    return fallbackDigit.repeat(2);
  }
  return String(Math.max(0, Math.min(99, value))).padStart(2, "0");
}

function readReturnToCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${RETURN_TO_COOKIE}=`));
  if (!match) return null;
  const raw = decodeURIComponent(match.slice(RETURN_TO_COOKIE.length + 1));
  return validateReturnTo(raw);
}

function clearReturnToCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${RETURN_TO_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}

/**
 * Client wrapper that ticks the countdown and, at T-0, probes the session
 * server-side before navigating. Anonymous → `/login`; authenticated →
 * validated `saa-returnTo` (or `/` if missing/invalid).
 *
 * Guards against double-navigation if `onComplete` fires while the probe is
 * still in flight.
 */
export function CountdownUnlock({
  eventStartAt,
  eventMalformed = false,
  labels,
  malformedDigit,
}: Props) {
  const router = useRouter();
  const navigatingRef = useRef(false);

  const handleComplete = useCallback(async () => {
    if (navigatingRef.current) return;
    navigatingRef.current = true;

    let authenticated = false;
    try {
      const response = await fetch("/api/auth/status", {
        cache: "no-store",
        credentials: "same-origin",
      });
      if (response.ok) {
        const body = (await response.json()) as { authenticated?: boolean };
        authenticated = body.authenticated === true;
      }
    } catch {
      // Treat probe failure as anonymous. Falls back to /login.
      authenticated = false;
    }

    let target: string;
    if (authenticated) {
      target = readReturnToCookie() ?? "/";
      clearReturnToCookie();
    } else {
      target = "/login";
    }

    router.replace(target);
  }, [router]);

  const delta = useEventCountdown({
    eventStartAt,
    eventMalformed,
    tickMs: 1000,
    onComplete: handleComplete,
  });

  return (
    <div
      role="timer"
      aria-live="polite"
      aria-atomic="true"
      className="flex items-center gap-15"
    >
      <Unit
        label={labels.days}
        value={pad(delta.days, eventMalformed, malformedDigit)}
        ariaLabel={`${labels.days} remaining`}
      />
      <Unit
        label={labels.hours}
        value={pad(delta.hours, eventMalformed, malformedDigit)}
        ariaLabel={`${labels.hours} remaining`}
      />
      <Unit
        label={labels.minutes}
        value={pad(delta.minutes, eventMalformed, malformedDigit)}
        ariaLabel={`${labels.minutes} remaining`}
      />
    </div>
  );
}

function Unit({
  label,
  value,
  ariaLabel,
}: {
  label: string;
  value: string;
  ariaLabel: string;
}) {
  return (
    <div
      className="flex w-[175px] flex-col items-start justify-center gap-[21px]"
      aria-label={`${ariaLabel}: ${value}`}
    >
      <div className="flex h-[123px] w-full items-center gap-[21px]">
        <GlassDigit digit={value[0] ?? "0"} />
        <GlassDigit digit={value[1] ?? "0"} />
      </div>
      <span
        className="text-[36px] font-bold leading-12 text-saa-text-primary"
        style={{
          fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
        }}
      >
        {label}
      </span>
    </div>
  );
}
