"use client";

import { useEffect, useState } from "react";

type Options = {
  /** Pause IntersectionObserver-driven updates for this many ms after the consumer signals a programmatic scroll. */
  lockMs?: number;
  /** Root margin passed to the IntersectionObserver. Defaults to a top-25% threshold. */
  rootMargin?: string;
};

type Result = {
  /** The id of the currently-active section, or null until the first observation. */
  activeId: string | null;
  /** Call this after a programmatic scroll to suppress scrollspy updates for the lock window. */
  lock: () => void;
  /** Force the active id (e.g., after a click), respecting the lock window. */
  setActiveId: (id: string) => void;
};

/**
 * Hooks an `IntersectionObserver` over an array of DOM ids and returns the
 * top-most currently-intersecting id. Designed for sticky scrollspy menus.
 *
 * The `lock` window prevents the observer from immediately overriding the
 * user's click while the page is still smooth-scrolling.
 */
export function useScrollspy(ids: readonly string[], options: Options = {}): Result {
  const { lockMs = 600, rootMargin = "-25% 0px -55% 0px" } = options;
  const [activeId, setActiveIdState] = useState<string | null>(null);
  const [lockedUntil, setLockedUntil] = useState<number>(0);

  useEffect(() => {
    if (ids.length === 0) return;
    if (typeof window === "undefined") return;
    if (typeof IntersectionObserver === "undefined") return;

    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (Date.now() < lockedUntil) return;
        // Pick the entry closest to the top that is intersecting.
        const intersecting = entries
          .filter((e) => e.isIntersecting)
          .map((e) => ({ id: e.target.id, top: e.boundingClientRect.top }))
          .sort((a, b) => a.top - b.top);
        if (intersecting.length > 0) {
          setActiveIdState(intersecting[0].id);
        }
      },
      { rootMargin, threshold: 0 },
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, [ids, rootMargin, lockedUntil]);

  function lock(): void {
    setLockedUntil(Date.now() + lockMs);
  }

  function setActiveId(id: string): void {
    lock();
    setActiveIdState(id);
  }

  return { activeId, lock, setActiveId };
}
