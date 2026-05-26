import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useEventCountdown } from "@/hooks/use-event-countdown";

const SEC = 1_000;
const MIN = 60 * SEC;
const HR = 60 * MIN;
const DAY = 24 * HR;

describe("useEventCountdown", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-01T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("computes a zero-padded delta from `eventStartAt` minus now", () => {
    const target = Date.now() + 5 * DAY + 6 * HR + 30 * MIN;
    const { result } = renderHook(() =>
      useEventCountdown({ eventStartAt: target }),
    );

    expect(result.current.days).toBe(5);
    expect(result.current.hours).toBe(6);
    expect(result.current.minutes).toBe(30);
    expect(result.current.reached).toBe(false);
  });

  it("decrements on each tick", () => {
    const target = Date.now() + 2 * MIN;
    const { result } = renderHook(() =>
      useEventCountdown({ eventStartAt: target, tickMs: 1000 }),
    );

    expect(result.current.minutes).toBe(2);

    act(() => {
      vi.advanceTimersByTime(60 * SEC);
    });
    expect(result.current.minutes).toBe(1);

    act(() => {
      vi.advanceTimersByTime(60 * SEC);
    });
    expect(result.current.minutes).toBe(0);
    expect(result.current.reached).toBe(true);
  });

  it("fires onComplete exactly once when delta reaches zero", () => {
    const target = Date.now() + 1 * MIN;
    const onComplete = vi.fn();

    renderHook(() =>
      useEventCountdown({ eventStartAt: target, tickMs: 1000, onComplete }),
    );

    expect(onComplete).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(60 * SEC);
    });
    expect(onComplete).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(5 * SEC);
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("returns reached=true and zeroes when `eventStartAt` is in the past", () => {
    const target = Date.now() - 1 * HR;
    const { result } = renderHook(() =>
      useEventCountdown({ eventStartAt: target }),
    );

    expect(result.current).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      reached: true,
    });
  });

  it("does not tick or call onComplete when `eventMalformed` is true", () => {
    const onComplete = vi.fn();
    renderHook(() =>
      useEventCountdown({
        eventStartAt: 0,
        eventMalformed: true,
        tickMs: 1000,
        onComplete,
      }),
    );

    act(() => {
      vi.advanceTimersByTime(60 * SEC);
    });

    expect(onComplete).not.toHaveBeenCalled();
  });

  it("respects the custom `tickMs` interval", () => {
    const target = Date.now() + 3 * MIN;
    const { result } = renderHook(() =>
      useEventCountdown({ eventStartAt: target, tickMs: 60_000 }),
    );

    expect(result.current.minutes).toBe(3);

    // Advance by < tickMs — the interval has not fired yet.
    act(() => {
      vi.advanceTimersByTime(30_000);
    });
    expect(result.current.minutes).toBe(3);

    // Now cross one tick — interval fires, recomputes.
    act(() => {
      vi.advanceTimersByTime(30_000);
    });
    expect(result.current.minutes).toBe(2);
  });
});
