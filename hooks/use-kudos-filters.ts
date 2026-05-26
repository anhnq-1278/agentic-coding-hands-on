"use client";

import { useCallback, useEffect, useState } from "react";
import type { KudosFilters } from "@/lib/kudos/types";

const HASHTAG_PARAM = "hashtag";
const DEPARTMENT_PARAM = "department";

/**
 * Filter state synced with the URL query string (per spec TR-005). One
 * filter at a time per plan §1 (setting hashtag clears department and
 * vice-versa) — keeps the mental model simple.
 */
export function useKudosFilters(
  initial: KudosFilters,
): {
  filters: KudosFilters;
  setHashtag: (value: string | null) => void;
  setDepartment: (value: string | null) => void;
  clear: () => void;
} {
  const [filters, setFilters] = useState<KudosFilters>(initial);

  // Re-sync from popstate (back/forward)
  useEffect(() => {
    if (typeof window === "undefined") return;
    function readFromUrl() {
      const sp = new URL(window.location.href).searchParams;
      const hashtag = sp.get(HASHTAG_PARAM);
      const dept = sp.get(DEPARTMENT_PARAM);
      setFilters({
        hashtag: hashtag && hashtag !== "" ? hashtag : null,
        departmentId: dept && dept !== "" ? dept : null,
      });
    }
    window.addEventListener("popstate", readFromUrl);
    return () => window.removeEventListener("popstate", readFromUrl);
  }, []);

  const pushUrl = useCallback((next: KudosFilters) => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (next.hashtag) {
      url.searchParams.set(HASHTAG_PARAM, next.hashtag);
    } else {
      url.searchParams.delete(HASHTAG_PARAM);
    }
    if (next.departmentId) {
      url.searchParams.set(DEPARTMENT_PARAM, next.departmentId);
    } else {
      url.searchParams.delete(DEPARTMENT_PARAM);
    }
    window.history.pushState(null, "", `${url.pathname}${url.search}`);
  }, []);

  const setHashtag = useCallback(
    (value: string | null) => {
      setFilters(() => {
        const next: KudosFilters = {
          hashtag: value && value !== "" ? value : null,
          // Setting hashtag clears department (one-filter-at-a-time)
          departmentId: null,
        };
        pushUrl(next);
        return next;
      });
    },
    [pushUrl],
  );

  const setDepartment = useCallback(
    (value: string | null) => {
      setFilters(() => {
        const next: KudosFilters = {
          hashtag: null,
          departmentId: value && value !== "" ? value : null,
        };
        pushUrl(next);
        return next;
      });
    },
    [pushUrl],
  );

  const clear = useCallback(() => {
    const next: KudosFilters = { hashtag: null, departmentId: null };
    setFilters(next);
    pushUrl(next);
  }, [pushUrl]);

  return { filters, setHashtag, setDepartment, clear };
}
