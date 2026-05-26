"use client";

import { useMemo } from "react";
import useSWR from "swr";
import type { SunnerProfile } from "@/lib/kudos/types";

async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as T;
}

function stripAccents(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function fuzzyMatch(query: string, target: string): boolean {
  if (query.length === 0) return true;
  const a = stripAccents(query.trim().toLowerCase());
  const b = stripAccents(target.toLowerCase());
  return b.includes(a);
}

type Options = {
  query: string;
  excludeSenderId?: string;
  limit?: number;
};

/**
 * SWR-backed Sunner directory lookup with client-side filtering. Used
 * for recipient autocomplete and `@mention` suggestions. Excludes the
 * sender so users can't pick themselves.
 */
export function useSunnerLookup({
  query,
  excludeSenderId,
  limit = 8,
}: Options): SunnerProfile[] {
  const { data } = useSWR<{ sunners: Record<string, SunnerProfile> }>(
    "/api/kudos/sunners",
    fetcher,
    { revalidateOnFocus: false },
  );
  return useMemo(() => {
    if (!data?.sunners) return [];
    const all = Object.values(data.sunners);
    const filtered = all.filter((sunner) => {
      if (excludeSenderId && sunner.id === excludeSenderId) return false;
      if (!fuzzyMatch(query, sunner.displayName)) return false;
      return true;
    });
    return filtered.slice(0, limit);
  }, [data, query, excludeSenderId, limit]);
}
