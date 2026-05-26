import {
  DEMO_CURRENT_USER_ID,
  SEED_DEPARTMENTS,
  SEED_HASHTAGS,
  SEED_HEARTS_BY_USER,
  SEED_KUDOS,
  SEED_RECENT_GIFTS,
  SEED_SECRET_BOXES,
  SEED_SUNNERS,
  SPECIAL_DAYS,
} from "@/lib/kudos/seed-data";
import type {
  Department,
  Hashtag,
  Kudos,
  KudosId,
  RecentGift,
  SecretBox,
  SunnerId,
  SunnerProfile,
} from "@/lib/kudos/types";

/**
 * In-memory mock repository for Sun* Kudos. Single-process, ephemeral.
 * Replaced by an ORM-backed repository when `APP_DATA_PERSISTENCE` lands.
 *
 * Boundary contract:
 *   - Mutations return the canonical record after applying the change.
 *   - `resetStore()` re-seeds to a known state (test isolation).
 *   - Never throws on "not found"; returns `null` / no-op for clean callers.
 */

type StoreShape = {
  kudosById: Map<KudosId, Kudos>;
  sunnersById: Map<SunnerId, SunnerProfile>;
  hashtagsByTag: Map<string, Hashtag>;
  departmentsById: Map<string, Department>;
  /** userId → set of kudos ids the user has hearted. */
  heartsByUser: Map<SunnerId, Set<KudosId>>;
  secretBoxes: SecretBox[];
  recentGifts: RecentGift[];
};

let store: StoreShape = empty();

function empty(): StoreShape {
  return {
    kudosById: new Map(),
    sunnersById: new Map(),
    hashtagsByTag: new Map(),
    departmentsById: new Map(),
    heartsByUser: new Map(),
    secretBoxes: [],
    recentGifts: [],
  };
}

function rebuildAggregates(s: StoreShape): void {
  // Reset counters
  for (const dept of s.departmentsById.values()) {
    dept.kudosCount = 0;
  }
  for (const tag of s.hashtagsByTag.values()) {
    tag.kudosCount = 0;
  }

  for (const kudos of s.kudosById.values()) {
    // Bump department counts (sender OR recipient department contributes)
    const senderDept = s.sunnersById.get(kudos.senderId)?.departmentId;
    const recipDept = s.sunnersById.get(kudos.recipientId)?.departmentId;
    if (senderDept) {
      const d = s.departmentsById.get(senderDept);
      if (d) d.kudosCount += 1;
    }
    if (recipDept && recipDept !== senderDept) {
      const d = s.departmentsById.get(recipDept);
      if (d) d.kudosCount += 1;
    }
    for (const tag of kudos.hashtags) {
      const t = s.hashtagsByTag.get(tag);
      if (t) t.kudosCount += 1;
    }
  }
}

export function resetStore(): void {
  const next = empty();

  for (const sunner of SEED_SUNNERS) {
    next.sunnersById.set(sunner.id, { ...sunner });
  }
  for (const dept of SEED_DEPARTMENTS) {
    next.departmentsById.set(dept.id, { ...dept });
  }
  for (const tag of SEED_HASHTAGS) {
    next.hashtagsByTag.set(tag.tag, { ...tag });
  }
  for (const kudos of SEED_KUDOS) {
    next.kudosById.set(kudos.id, { ...kudos });
  }
  for (const [userId, kudosIds] of SEED_HEARTS_BY_USER.entries()) {
    next.heartsByUser.set(userId, new Set(kudosIds));
  }
  next.secretBoxes = SEED_SECRET_BOXES.map((b) => ({ ...b }));
  next.recentGifts = SEED_RECENT_GIFTS.map((g) => ({ ...g }));

  rebuildAggregates(next);
  store = next;
}

// Initial seed at module load. resetStore() is idempotent and called by tests.
resetStore();

/**
 * Return a Kudos with `isHeartedByCurrentUser` resolved against the given
 * viewer. Callers downstream of route handlers always pass the
 * authenticated user's id.
 */
function projectKudos(kudos: Kudos, viewerId: SunnerId | null): Kudos {
  const isHearted =
    viewerId !== null
      ? (store.heartsByUser.get(viewerId)?.has(kudos.id) ?? false)
      : false;
  if (isHearted === kudos.isHeartedByCurrentUser) {
    return kudos;
  }
  return { ...kudos, isHeartedByCurrentUser: isHearted };
}

// ────────────────────────── lookups ──────────────────────────

export function getKudosById(
  id: KudosId,
  viewerId: SunnerId | null,
): Kudos | null {
  const k = store.kudosById.get(id);
  return k ? projectKudos(k, viewerId) : null;
}

export function getSunnerById(id: SunnerId): SunnerProfile | null {
  return store.sunnersById.get(id) ?? null;
}

export function getDepartments(): readonly Department[] {
  return Array.from(store.departmentsById.values()).sort(
    (a, b) => b.kudosCount - a.kudosCount,
  );
}

export function getHashtags(): readonly Hashtag[] {
  return Array.from(store.hashtagsByTag.values()).sort(
    (a, b) => b.kudosCount - a.kudosCount,
  );
}

export function getRecentGifts(limit = 10): readonly RecentGift[] {
  return [...store.recentGifts]
    .sort(
      (a, b) =>
        new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime(),
    )
    .slice(0, limit);
}

// ────────────────────────── feed / list ──────────────────────────

export type ListFilters = {
  hashtag: string | null;
  departmentId: string | null;
};

function matchesFilters(kudos: Kudos, f: ListFilters): boolean {
  if (f.hashtag !== null) {
    if (!kudos.hashtags.includes(f.hashtag)) return false;
  }
  if (f.departmentId !== null) {
    const sender = store.sunnersById.get(kudos.senderId);
    const recipient = store.sunnersById.get(kudos.recipientId);
    const matchSender = sender?.departmentId === f.departmentId;
    const matchRecipient = recipient?.departmentId === f.departmentId;
    if (!matchSender && !matchRecipient) return false;
  }
  return true;
}

/**
 * List Kudos sorted by `createdAt desc`, cursor-paginated. Cursor encodes
 * the `(createdAt, id)` of the LAST item returned in the previous page.
 */
export function listKudos(
  filters: ListFilters,
  cursor: string | null,
  limit: number,
  viewerId: SunnerId | null,
): { items: Kudos[]; nextCursor: string | null } {
  const matched = Array.from(store.kudosById.values()).filter((k) =>
    matchesFilters(k, filters),
  );
  // Sort: createdAt desc, then id desc for stable order on ties
  matched.sort((a, b) => {
    if (a.createdAt !== b.createdAt) {
      return a.createdAt < b.createdAt ? 1 : -1;
    }
    return a.id < b.id ? 1 : -1;
  });

  let startIndex = 0;
  if (cursor !== null) {
    const [cAt, cId] = cursor.split("|");
    startIndex = matched.findIndex((k) => k.id === cId && k.createdAt === cAt);
    if (startIndex < 0) {
      startIndex = matched.length; // unknown cursor → empty page
    } else {
      startIndex += 1;
    }
  }
  const slice = matched.slice(startIndex, startIndex + limit);
  const last = slice[slice.length - 1];
  const nextCursor =
    slice.length === limit && last
      ? `${last.createdAt}|${last.id}`
      : null;
  return {
    items: slice.map((k) => projectKudos(k, viewerId)),
    nextCursor,
  };
}

/**
 * Top-N by heart count (filter-scoped). Ties broken by `createdAt desc`.
 */
export function listHighlights(
  filters: ListFilters,
  limit: number,
  viewerId: SunnerId | null,
): Kudos[] {
  const matched = Array.from(store.kudosById.values()).filter((k) =>
    matchesFilters(k, filters),
  );
  matched.sort((a, b) => {
    if (b.heartsCount !== a.heartsCount) {
      return b.heartsCount - a.heartsCount;
    }
    return a.createdAt < b.createdAt ? 1 : -1;
  });
  return matched.slice(0, limit).map((k) => projectKudos(k, viewerId));
}

// ────────────────────────── mutations ──────────────────────────

export type InsertKudosInput = {
  id: KudosId;
  senderId: SunnerId;
  recipientId: SunnerId;
  headline: string;
  message: string;
  hashtags: readonly string[];
  images: readonly string[];
  createdAt: string;
  isAnonymous?: boolean;
  anonymousAlias?: string | null;
};

export function insertKudos(input: InsertKudosInput): Kudos {
  const dateKey = input.createdAt.slice(0, 10);
  const kudos: Kudos = {
    ...input,
    heartsCount: 0,
    isHeartedByCurrentUser: false,
    isSpecialDay: SPECIAL_DAYS.has(dateKey),
    detailUrl: `/sun-kudos/${input.id}`,
    isAnonymous: input.isAnonymous ?? false,
    anonymousAlias: input.anonymousAlias ?? null,
  };
  store.kudosById.set(kudos.id, kudos);

  const sender = store.sunnersById.get(input.senderId);
  if (sender) sender.kudosSent += 1;
  const recipient = store.sunnersById.get(input.recipientId);
  if (recipient) recipient.kudosReceived += 1;

  rebuildAggregates(store);
  return kudos;
}

/**
 * Idempotent set: caller passes `next` instead of incrementing, so rapid
 * clicks always converge on the requested state. Returns `null` if the
 * kudos doesn't exist; returns the updated kudos otherwise.
 *
 * Special-day +2 leaderboard logic applies to the SENDER's heart total.
 * The card's `heartsCount` always changes by ±1 (unique-likers count).
 */
export function setHeart(
  viewerId: SunnerId,
  kudosId: KudosId,
  next: boolean,
): {
  kudos: Kudos;
  senderHeartDelta: 0 | 1 | -1 | 2 | -2;
} | null {
  const kudos = store.kudosById.get(kudosId);
  if (!kudos) return null;
  if (kudos.senderId === viewerId) {
    throw new HeartSelfBlockError();
  }
  let hearted = store.heartsByUser.get(viewerId);
  if (!hearted) {
    hearted = new Set();
    store.heartsByUser.set(viewerId, hearted);
  }
  const prev = hearted.has(kudosId);
  if (prev === next) {
    // Idempotent — no-op
    return { kudos: projectKudos(kudos, viewerId), senderHeartDelta: 0 };
  }
  let senderDelta: 0 | 1 | -1 | 2 | -2 = 0;
  if (next) {
    hearted.add(kudosId);
    kudos.heartsCount += 1;
    senderDelta = kudos.isSpecialDay ? 2 : 1;
  } else {
    hearted.delete(kudosId);
    kudos.heartsCount = Math.max(0, kudos.heartsCount - 1);
    senderDelta = kudos.isSpecialDay ? -2 : -1;
  }
  const sender = store.sunnersById.get(kudos.senderId);
  if (sender) {
    sender.heartsReceived = Math.max(0, sender.heartsReceived + senderDelta);
  }
  return {
    kudos: projectKudos(kudos, viewerId),
    senderHeartDelta: senderDelta,
  };
}

export class HeartSelfBlockError extends Error {
  constructor() {
    super("Sender cannot heart their own Kudos.");
    this.name = "HeartSelfBlockError";
  }
}

export function openNextSecretBox(userId: SunnerId): SecretBox | null {
  const pending = store.secretBoxes.find(
    (b) => b.userId === userId && b.status === "pending",
  );
  if (!pending) return null;
  pending.status = "opened";
  pending.openedAt = new Date().toISOString();
  pending.rewardLabel =
    pending.rewardLabel === "—" ? "Voucher cà phê Sun*" : pending.rewardLabel;
  const sunner = store.sunnersById.get(userId);
  if (sunner) {
    sunner.secretBoxesOpened += 1;
    sunner.secretBoxesPending = Math.max(0, sunner.secretBoxesPending - 1);
  }
  return pending;
}

// ────────────────────────── current user ──────────────────────────

/**
 * The "current user" in the mock world. Mapped from the authenticated JWT's
 * email when available; otherwise falls back to the demo seed user. This
 * keeps the demo wall usable for ANY logged-in Sunner while production code
 * just maps `session.user.id`.
 */
export function resolveSunnerIdForEmail(email: string): SunnerId {
  for (const sunner of store.sunnersById.values()) {
    if (sunner.email.toLowerCase() === email.toLowerCase()) {
      return sunner.id;
    }
  }
  return DEMO_CURRENT_USER_ID;
}
