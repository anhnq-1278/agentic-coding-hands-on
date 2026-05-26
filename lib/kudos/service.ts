import {
  getDepartments,
  getHashtags,
  getKudosById,
  getRecentGifts,
  getSunnerById,
  HeartSelfBlockError,
  insertKudos,
  listHighlights,
  listKudos,
  openNextSecretBox,
  resolveSunnerIdForEmail,
  setHeart,
} from "@/lib/kudos/store";
import type {
  Department,
  FeedPage,
  Hashtag,
  HeartToggleResult,
  Kudos,
  KudosFilters,
  KudosId,
  RecentGift,
  SecretBox,
  SidebarStats,
  SpotlightNode,
  SunnerId,
} from "@/lib/kudos/types";
import type { SendKudosInput } from "@/lib/kudos/validators";

const DEFAULT_FEED_LIMIT = 20;
const HIGHLIGHT_LIMIT = 5;
const RECENT_GIFTS_LIMIT = 10;

/**
 * Service layer for Sun* Kudos. All business logic lives here; route
 * handlers stay thin (auth + validate + delegate). When the real backend
 * lands, only the imports above change — the function bodies stay.
 */

export function getViewerId(email: string): SunnerId {
  return resolveSunnerIdForEmail(email);
}

export function listFeed(
  filters: KudosFilters,
  cursor: string | null,
  limit: number | null,
  viewerId: SunnerId,
): FeedPage {
  const { items, nextCursor } = listKudos(
    {
      hashtag: filters.hashtag,
      departmentId: filters.departmentId,
    },
    cursor,
    limit ?? DEFAULT_FEED_LIMIT,
    viewerId,
  );
  return { items, nextCursor };
}

export function getHighlights(
  filters: KudosFilters,
  viewerId: SunnerId,
): readonly Kudos[] {
  return listHighlights(
    {
      hashtag: filters.hashtag,
      departmentId: filters.departmentId,
    },
    HIGHLIGHT_LIMIT,
    viewerId,
  );
}

/**
 * Build Spotlight nodes — one entry per recipient who has received at
 * least one Kudos under the active filter scope. Optional `query` further
 * narrows to recipients whose display name contains the query
 * (case-insensitive, accent-insensitive on a best-effort basis).
 */
export function getSpotlightNodes(
  filters: KudosFilters,
  query: string | null,
): readonly SpotlightNode[] {
  // Use a large limit page to fetch all matching kudos (mock store is small).
  const { items } = listKudos(
    {
      hashtag: filters.hashtag,
      departmentId: filters.departmentId,
    },
    null,
    10000,
    null,
  );

  const byRecipient = new Map<
    SunnerId,
    {
      recipientId: SunnerId;
      displayName: string;
      kudosCount: number;
      mostRecentKudosId: KudosId;
      mostRecentReceivedAt: string;
    }
  >();
  for (const k of items) {
    const recipient = getSunnerById(k.recipientId);
    if (!recipient) continue;
    const prev = byRecipient.get(k.recipientId);
    if (!prev) {
      byRecipient.set(k.recipientId, {
        recipientId: k.recipientId,
        displayName: recipient.displayName,
        kudosCount: 1,
        mostRecentKudosId: k.id,
        mostRecentReceivedAt: k.createdAt,
      });
    } else {
      prev.kudosCount += 1;
      if (k.createdAt > prev.mostRecentReceivedAt) {
        prev.mostRecentReceivedAt = k.createdAt;
        prev.mostRecentKudosId = k.id;
      }
    }
  }

  let nodes = Array.from(byRecipient.values());
  if (query !== null) {
    const q = stripAccents(query.toLowerCase());
    nodes = nodes.filter((n) =>
      stripAccents(n.displayName.toLowerCase()).includes(q),
    );
  }
  nodes.sort((a, b) => b.kudosCount - a.kudosCount);
  return nodes;
}

function stripAccents(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export class RecipientIsSelfError extends Error {
  constructor() {
    super("Sender cannot send a Kudos to themselves.");
    this.name = "RecipientIsSelfError";
  }
}

export function sendKudos(
  senderId: SunnerId,
  input: SendKudosInput,
): Kudos {
  if (input.recipientId === senderId) {
    throw new RecipientIsSelfError();
  }
  const id: KudosId = `kudos-${Math.random().toString(36).slice(2, 10)}`;
  return insertKudos({
    id,
    senderId,
    recipientId: input.recipientId,
    headline: input.headline,
    message: input.message,
    hashtags: input.hashtags,
    images: input.images,
    createdAt: new Date().toISOString(),
    isAnonymous: input.isAnonymous,
    anonymousAlias: input.anonymousAlias,
  });
}

export function toggleHeart(
  viewerId: SunnerId,
  kudosId: KudosId,
  next: boolean,
): HeartToggleResult {
  let result: ReturnType<typeof setHeart>;
  try {
    result = setHeart(viewerId, kudosId, next);
  } catch (err) {
    if (err instanceof HeartSelfBlockError) {
      throw err;
    }
    throw err;
  }
  if (!result) {
    throw new KudosNotFoundError(kudosId);
  }
  return {
    kudos: result.kudos,
    isHeartedByCurrentUser: result.kudos.isHeartedByCurrentUser,
    heartsCount: result.kudos.heartsCount,
    senderHeartDelta: result.senderHeartDelta,
  };
}

export class KudosNotFoundError extends Error {
  constructor(kudosId: KudosId) {
    super(`Kudos "${kudosId}" not found.`);
    this.name = "KudosNotFoundError";
  }
}

export { HeartSelfBlockError };

export function openSecretBox(
  userId: SunnerId,
): { box: SecretBox } | { box: null } {
  const box = openNextSecretBox(userId);
  return { box };
}

export function getSidebarStats(userId: SunnerId): SidebarStats | null {
  const user = getSunnerById(userId);
  if (!user) return null;
  return {
    user: {
      id: user.id,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      departmentName: user.departmentName,
      title: user.title,
      badge: user.badge,
      kudosReceived: user.kudosReceived,
      kudosSent: user.kudosSent,
      heartsReceived: user.heartsReceived,
      secretBoxesOpened: user.secretBoxesOpened,
      secretBoxesPending: user.secretBoxesPending,
    },
    recentGifts: getRecentGifts(RECENT_GIFTS_LIMIT),
  };
}

export function getKudosDetail(
  id: KudosId,
  viewerId: SunnerId,
): Kudos | null {
  return getKudosById(id, viewerId);
}

export function listHashtags(): readonly Hashtag[] {
  return getHashtags();
}

export function listDepartments(): readonly Department[] {
  return getDepartments();
}

export function listRecentGifts(): readonly RecentGift[] {
  return getRecentGifts(RECENT_GIFTS_LIMIT);
}

/**
 * Bulk Sunner directory keyed by id. Used by the All Kudos feed UI to
 * join sender/recipient ids → profile data without one round-trip per
 * card. Real backend can stream this from the user service or include
 * the joined fields inline on the feed response.
 */
export function listSunnerDirectory(): Record<
  string,
  ReturnType<typeof toDirectoryEntry>
> {
  const directory: Record<string, ReturnType<typeof toDirectoryEntry>> = {};
  // Iterate via spotlight aggregation as a side effect would be wasteful;
  // we lean on the store directly via the seed export. For simplicity in
  // this mock, list ALL kudos and pluck unique sunner ids, then resolve
  // each through getSunnerById.
  const seen = new Set<string>();
  const feed = listKudos(
    { hashtag: null, departmentId: null },
    null,
    10000,
    null,
  );
  for (const k of feed.items) {
    seen.add(k.senderId);
    seen.add(k.recipientId);
  }
  for (const id of seen) {
    const sunner = getSunnerById(id);
    if (sunner) directory[id] = toDirectoryEntry(sunner);
  }
  return directory;
}

function toDirectoryEntry(sunner: {
  id: string;
  displayName: string;
  avatarUrl: string;
  departmentId: string;
  departmentName: string;
  title: string;
  badge: string;
  kudosReceived: number;
  kudosSent: number;
}) {
  return {
    id: sunner.id,
    displayName: sunner.displayName,
    avatarUrl: sunner.avatarUrl,
    departmentId: sunner.departmentId,
    departmentName: sunner.departmentName,
    title: sunner.title,
    badge: sunner.badge,
    kudosReceived: sunner.kudosReceived,
    kudosSent: sunner.kudosSent,
  };
}
