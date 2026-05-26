/**
 * Sun* Kudos domain types. See spec.md §Key Entities for narrative.
 *
 * IDs are opaque strings (UUID-like) so the in-memory mock store can swap
 * to a real ORM later without changing call sites.
 */

export type SunnerId = string;
export type KudosId = string;
export type DepartmentId = string;
export type SecretBoxId = string;

/**
 * Badge tier image rendered next to a Sunner name. Maps 1:1 to one of the
 * downloaded PNGs under `public/assets/sun-kudos/badges/`.
 */
export type HeroBadge = "new" | "rising" | "legend" | "super";

/**
 * Star tier (hoa thị) derived from `kudosReceived`:
 *   0 → no star, 1 → ≥10 received, 2 → ≥20, 3 → ≥50.
 */
export type StarTier = 0 | 1 | 2 | 3;

export type SunnerProfile = {
  id: SunnerId;
  displayName: string;
  email: string;
  avatarUrl: string;
  departmentId: DepartmentId;
  departmentName: string;
  title: string;
  badge: HeroBadge;
  kudosReceived: number;
  kudosSent: number;
  heartsReceived: number;
  secretBoxesOpened: number;
  secretBoxesPending: number;
};

export type Department = {
  id: DepartmentId;
  name: string;
  /** Count of Kudos where sender OR recipient is in this department. */
  kudosCount: number;
};

export type Hashtag = {
  tag: string;
  kudosCount: number;
};

export type Kudos = {
  id: KudosId;
  senderId: SunnerId;
  recipientId: SunnerId;
  /** Honorific title the sender awards the recipient (Frame 552 in Figma).
   *  Renders as the centred bold heading on the cream card. */
  headline: string;
  message: string;
  hashtags: readonly string[];
  /** Up to 5 image URLs per spec FR-020. */
  images: readonly string[];
  createdAt: string;
  /** Count of unique users who hearted this kudos. */
  heartsCount: number;
  /** Server-computed for the current user. Always false on server-side rendering for anonymous viewers. */
  isHeartedByCurrentUser: boolean;
  /** Admin-configured special day flag — true when `createdAt`'s YYYY-MM-DD is in `SPECIAL_DAYS`. */
  isSpecialDay: boolean;
  /** Stable shareable URL — `/sun-kudos/[id]` (detail page is out of scope v1). */
  detailUrl: string;
  /** True if the sender chose to send anonymously. Card UI hides sender
   *  identity; server still stores `senderId` for audit. */
  isAnonymous: boolean;
  /** Optional display name when `isAnonymous=true`. `null` falls back to
   *  the dictionary's default "Ẩn danh" placeholder at render-time. */
  anonymousAlias: string | null;
};

/**
 * Client-side draft for the Viết Kudo composer. Becomes the POST body to
 * `/api/kudos` (after image upload step). `images` here is a list of URLs
 * returned by `POST /api/kudos/uploads`.
 */
export type ComposerDraft = {
  recipientId: SunnerId;
  headline: string;
  message: string;
  hashtags: readonly string[];
  images: readonly string[];
  isAnonymous: boolean;
  anonymousAlias: string | null;
};

/**
 * Composer-local image state. `file` and `previewUrl` are transient and
 * are cleaned up on submit / unmount. Once uploaded, the server URL is
 * stored on `uploadedUrl`.
 */
export type UploadedImage = {
  id: string;
  file: File;
  previewUrl: string;
  status: "pending" | "uploading" | "uploaded" | "error";
  uploadedUrl?: string;
};

export type KudosFilters = {
  hashtag: string | null;
  departmentId: DepartmentId | null;
};

export type FeedPage = {
  items: readonly Kudos[];
  nextCursor: string | null;
};

export type SpotlightNode = {
  recipientId: SunnerId;
  displayName: string;
  /** Number of Kudos received by this recipient under the current filter scope. */
  kudosCount: number;
  mostRecentKudosId: KudosId;
  mostRecentReceivedAt: string;
};

export type SidebarStats = {
  user: Pick<
    SunnerProfile,
    | "id"
    | "displayName"
    | "avatarUrl"
    | "departmentName"
    | "title"
    | "badge"
    | "kudosReceived"
    | "kudosSent"
    | "heartsReceived"
    | "secretBoxesOpened"
    | "secretBoxesPending"
  >;
  recentGifts: readonly RecentGift[];
};

export type RecentGift = {
  id: string;
  sunner: Pick<SunnerProfile, "id" | "displayName" | "avatarUrl" | "title">;
  /** Short description of the gift, e.g. "Áo hoodie SAA 2025". */
  giftDescription: string;
  receivedAt: string;
};

export type SecretBox = {
  id: SecretBoxId;
  userId: SunnerId;
  status: "opened" | "pending";
  rewardLabel: string;
  openedAt: string | null;
};

export type HeartToggleResult = {
  kudos: Kudos;
  isHeartedByCurrentUser: boolean;
  heartsCount: number;
  /** Increment applied to the SENDER's leaderboard `heartsReceived` total. */
  senderHeartDelta: 0 | 1 | -1 | 2 | -2;
};

/** Cursor pagination — opaque string token. */
export type FeedCursor = string | null;
