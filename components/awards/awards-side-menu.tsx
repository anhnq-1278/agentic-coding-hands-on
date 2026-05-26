"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef } from "react";
import { AWARD_CATALOG } from "@/lib/awards/catalog";
import { getAwardsSectionId } from "@/components/awards/awards-section-id";
import { useScrollspy } from "@/hooks/use-scrollspy";

const TARGET_ICON_SRC = "/assets/awards-information/icons/target.svg";

const DEFAULT_ACTIVE_SLUG = "top-talent" as const;

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function scrollToSlug(slug: string, behavior: ScrollBehavior): void {
  const el = document.getElementById(getAwardsSectionId(slug));
  if (!el) return;
  el.scrollIntoView({ behavior, block: "start" });
}

/**
 * `C_Menu list` (`313:8459`) — sticky scrollspy side menu with six award
 * navigation items. Drives the right column via in-page anchors.
 *
 * Behaviors:
 *  - Click → smooth-scroll + `history.replaceState` with `#slug` + active state.
 *  - Manual scroll → IntersectionObserver updates active (300ms after a click
 *    is settled via the `useScrollspy` lock window).
 *  - Initial mount → read `window.location.hash`; if it matches a slug,
 *    scroll instantly (jump-on-load) and set active. If invalid/missing,
 *    default to Top Talent active without scrolling.
 *  - `prefers-reduced-motion: reduce` → all scrolls are instant.
 */
export function AwardsSideMenu() {
  const slugs = useMemo(() => AWARD_CATALOG.map((c) => c.slug), []);
  const sectionIds = useMemo(() => slugs.map(getAwardsSectionId), [slugs]);
  const { activeId, setActiveId } = useScrollspy(sectionIds);
  const initialMountRef = useRef(true);

  // Initial-load deep-link handling.
  useEffect(() => {
    if (!initialMountRef.current) return;
    initialMountRef.current = false;

    const rawHash = window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : "";
    if (rawHash && slugs.includes(rawHash)) {
      // Instant jump on first load — don't trigger a smooth-scroll animation
      // on top of the browser's native anchor jump.
      scrollToSlug(rawHash, "auto");
      setActiveId(getAwardsSectionId(rawHash));
    } else {
      // Unknown / missing hash → default Top Talent active, no scroll.
      setActiveId(getAwardsSectionId(DEFAULT_ACTIVE_SLUG));
    }
  }, [slugs, setActiveId]);

  function handleClick(slug: string, event: React.MouseEvent<HTMLAnchorElement>): void {
    event.preventDefault();
    const behavior: ScrollBehavior = prefersReducedMotion() ? "auto" : "smooth";
    scrollToSlug(slug, behavior);
    setActiveId(getAwardsSectionId(slug));
    if (window.history?.replaceState) {
      window.history.replaceState(null, "", `#${slug}`);
    }
  }

  return (
    <nav aria-label="Awards" className="flex flex-col gap-4">
      {AWARD_CATALOG.map((category) => {
        const id = getAwardsSectionId(category.slug);
        const active = activeId === id;
        return (
          <a
            key={category.slug}
            href={`#${category.slug}`}
            aria-current={active ? "true" : undefined}
            onClick={(e) => handleClick(category.slug, e)}
            className={
              active
                ? "flex items-center gap-1 border-b border-saa-cta-bg px-4 py-2 text-saa-cta-bg"
                : "flex items-center gap-1 border-b border-transparent px-4 py-2 text-saa-text-primary transition-colors hover:text-saa-cta-bg/80"
            }
            style={{
              fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
            }}
          >
            <Image
              src={TARGET_ICON_SRC}
              alt=""
              width={24}
              height={24}
              className={active ? "h-6 w-6" : "h-6 w-6 opacity-60"}
            />
            <span
              className="text-sm font-bold leading-5 tracking-[0.25px]"
              style={
                active
                  ? {
                      textShadow:
                        "0 4px 4px rgba(0, 0, 0, 0.25), 0 0 6px var(--color-saa-glow)",
                    }
                  : undefined
              }
            >
              {category.title}
            </span>
          </a>
        );
      })}
    </nav>
  );
}
