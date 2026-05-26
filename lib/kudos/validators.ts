import { getDepartments, getHashtags, getSunnerById } from "@/lib/kudos/store";
import type { KudosFilters } from "@/lib/kudos/types";

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; status: 400 | 404; errors: readonly string[] };

const MAX_KUDOS_MESSAGE_LEN = 2000;
const MAX_HASHTAGS_PER_KUDOS = 10;
const MAX_IMAGES_PER_KUDOS = 5;
const MAX_SEARCH_LEN = 100;

export function validateFilters(
  rawHashtag: string | null,
  rawDepartmentId: string | null,
): ValidationResult<KudosFilters> {
  const errors: string[] = [];
  let hashtag: string | null = null;
  if (rawHashtag !== null && rawHashtag !== "") {
    const known = getHashtags().some((h) => h.tag === rawHashtag);
    if (!known) {
      errors.push(`Unknown hashtag "${rawHashtag}"`);
    } else {
      hashtag = rawHashtag;
    }
  }
  let departmentId: string | null = null;
  if (rawDepartmentId !== null && rawDepartmentId !== "") {
    const known = getDepartments().some((d) => d.id === rawDepartmentId);
    if (!known) {
      errors.push(`Unknown department "${rawDepartmentId}"`);
    } else {
      departmentId = rawDepartmentId;
    }
  }
  if (errors.length > 0) {
    return { ok: false, status: 400, errors };
  }
  return { ok: true, value: { hashtag, departmentId } };
}

export function validateCursorAndLimit(
  rawCursor: string | null,
  rawLimit: string | null,
): ValidationResult<{ cursor: string | null; limit: number }> {
  const cursor = rawCursor && rawCursor !== "" ? rawCursor : null;
  let limit = 20;
  if (rawLimit !== null && rawLimit !== "") {
    const n = Number.parseInt(rawLimit, 10);
    if (!Number.isFinite(n) || n <= 0 || n > 100) {
      return {
        ok: false,
        status: 400,
        errors: ["limit must be an integer in [1, 100]"],
      };
    }
    limit = n;
  }
  return { ok: true, value: { cursor, limit } };
}

export type SendKudosInput = {
  recipientId: string;
  headline: string;
  message: string;
  hashtags: readonly string[];
  images: readonly string[];
  isAnonymous: boolean;
  anonymousAlias: string | null;
};

const MAX_ANON_ALIAS_LEN = 60;
const MAX_HEADLINE_LEN = 80;

/**
 * Normalise hashtags per spec FR-006 + plan §4:
 *   - Strip leading `#`
 *   - Trim whitespace
 *   - Dedupe case-insensitively (keep first casing)
 */
function normaliseHashtags(raw: readonly string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const tag of raw) {
    const trimmed = tag.trim().replace(/^#+/, "").trim();
    if (trimmed.length === 0) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(trimmed);
  }
  return result;
}

export function validateSendKudosBody(
  body: unknown,
  senderId: string,
): ValidationResult<SendKudosInput> {
  if (typeof body !== "object" || body === null) {
    return { ok: false, status: 400, errors: ["Body must be an object"] };
  }
  const b = body as Record<string, unknown>;
  const errors: string[] = [];
  if (typeof b.recipientId !== "string" || b.recipientId.length === 0) {
    errors.push("recipientId is required");
  } else if (b.recipientId === senderId) {
    errors.push("RECIPIENT_IS_SELF: recipient cannot be the sender");
  } else if (!getSunnerById(b.recipientId)) {
    errors.push(`Unknown recipient "${b.recipientId}"`);
  }
  let headline = "";
  if (typeof b.headline !== "string") {
    errors.push("headline must be a string");
  } else {
    const trimmed = b.headline.trim();
    if (trimmed.length === 0) {
      errors.push("headline must not be empty");
    } else if (trimmed.length > MAX_HEADLINE_LEN) {
      errors.push(`headline exceeds ${MAX_HEADLINE_LEN} characters`);
    } else {
      headline = trimmed;
    }
  }
  if (typeof b.message !== "string") {
    errors.push("message must be a string");
  } else {
    const trimmed = b.message.trim();
    if (trimmed.length === 0) {
      errors.push("message must not be empty");
    } else if (trimmed.length > MAX_KUDOS_MESSAGE_LEN) {
      errors.push(`message exceeds ${MAX_KUDOS_MESSAGE_LEN} characters`);
    }
  }
  const hashtagsRaw = b.hashtags;
  let hashtags: string[] = [];
  if (hashtagsRaw !== undefined) {
    if (!Array.isArray(hashtagsRaw)) {
      errors.push("hashtags must be an array of strings");
    } else if (hashtagsRaw.some((t) => typeof t !== "string")) {
      errors.push("hashtags must be strings");
    } else {
      hashtags = normaliseHashtags(hashtagsRaw as string[]);
      if (hashtags.length === 0) {
        errors.push("hashtags must include at least one non-empty tag");
      } else if (hashtags.length > MAX_HASHTAGS_PER_KUDOS) {
        errors.push(`hashtags must be ≤ ${MAX_HASHTAGS_PER_KUDOS}`);
      }
    }
  } else {
    errors.push("hashtags must include at least one non-empty tag");
  }
  const imagesRaw = b.images;
  let images: string[] = [];
  if (imagesRaw !== undefined) {
    if (!Array.isArray(imagesRaw)) {
      errors.push("images must be an array of strings");
    } else if (imagesRaw.length > MAX_IMAGES_PER_KUDOS) {
      errors.push(`images must be ≤ ${MAX_IMAGES_PER_KUDOS}`);
    } else if (imagesRaw.some((s) => typeof s !== "string" || s === "")) {
      errors.push("images must be non-empty strings");
    } else {
      images = imagesRaw as string[];
    }
  }
  let isAnonymous = false;
  if (b.isAnonymous !== undefined) {
    if (typeof b.isAnonymous !== "boolean") {
      errors.push("isAnonymous must be a boolean");
    } else {
      isAnonymous = b.isAnonymous;
    }
  }
  let anonymousAlias: string | null = null;
  if (b.anonymousAlias !== undefined && b.anonymousAlias !== null) {
    if (typeof b.anonymousAlias !== "string") {
      errors.push("anonymousAlias must be a string or null");
    } else {
      const trimmed = b.anonymousAlias.trim();
      if (trimmed.length > MAX_ANON_ALIAS_LEN) {
        errors.push(
          `anonymousAlias exceeds ${MAX_ANON_ALIAS_LEN} characters`,
        );
      } else if (trimmed.length > 0) {
        anonymousAlias = trimmed;
      }
    }
  }
  // Alias is only persisted when `isAnonymous=true`. Drop it otherwise to
  // avoid stale state from a previous toggle.
  if (!isAnonymous) {
    anonymousAlias = null;
  }
  if (errors.length > 0) {
    return { ok: false, status: 400, errors };
  }
  return {
    ok: true,
    value: {
      recipientId: b.recipientId as string,
      headline,
      message: (b.message as string).trim(),
      hashtags,
      images,
      isAnonymous,
      anonymousAlias,
    },
  };
}

export function validateHeartBody(
  body: unknown,
): ValidationResult<{ next: boolean }> {
  if (typeof body !== "object" || body === null) {
    return { ok: false, status: 400, errors: ["Body must be an object"] };
  }
  const b = body as Record<string, unknown>;
  if (typeof b.next !== "boolean") {
    return {
      ok: false,
      status: 400,
      errors: ["`next` must be a boolean (true=heart, false=unheart)"],
    };
  }
  return { ok: true, value: { next: b.next } };
}

export function validateSearchQuery(
  raw: string | null,
): ValidationResult<string | null> {
  if (raw === null || raw === "") {
    return { ok: true, value: null };
  }
  if (raw.length > MAX_SEARCH_LEN) {
    return {
      ok: false,
      status: 400,
      errors: [`search query exceeds ${MAX_SEARCH_LEN} characters`],
    };
  }
  return { ok: true, value: raw };
}
