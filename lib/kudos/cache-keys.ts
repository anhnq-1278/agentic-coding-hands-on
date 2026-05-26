/**
 * Centralized SWR cache key family for `/sun-kudos` data. Mutations
 * (send Kudos, toggle heart, open secret box) invalidate matching keys
 * via `mutate` from this module so callers don't construct keys ad-hoc.
 *
 * Key shape: tuple `[endpoint, filters]` keeps `(hashtag, department)`
 * variants distinct in the cache.
 */
import type { KudosFilters } from "@/lib/kudos/types";

export const KUDOS_ENDPOINTS = {
  feed: "/api/kudos/feed",
  highlight: "/api/kudos/highlight",
  spotlight: "/api/kudos/spotlight",
  hashtags: "/api/kudos/hashtags",
  departments: "/api/kudos/departments",
  usersMe: "/api/users/me",
} as const;

export type FilteredKey = readonly [endpoint: string, filters: KudosFilters];
