/**
 * Accepts only relative paths starting with `/`. Optionally permits a single
 * `#fragment` whose body matches `[A-Za-z0-9-]+` so deep links into
 * sectioned pages (e.g. `/awards-information#top-talent`) survive the
 * sign-in round-trip.
 *
 * Rejects:
 * - Empty strings
 * - Protocol-relative URLs (`//evil.com/...`)
 * - Absolute URLs (`https://...`, `http://...`)
 * - `javascript:` and similar scheme smuggles
 * - Backslash escapes (`/\\evil.com`)
 * - Whitespace, control characters
 * - Multiple `#` fragments
 * - Empty fragment (`/path#`)
 * - Fragment with anything other than `[A-Za-z0-9-]`
 *
 * Returns the validated path (with hash if present) on success, `null`
 * otherwise. Callers MUST fall back to `/` (or another safe default) when
 * this returns `null`.
 */
export function validateReturnTo(raw: string | undefined | null): string | null {
  if (!raw) {
    return null;
  }
  if (!raw.startsWith("/")) {
    return null;
  }
  if (raw.startsWith("//")) {
    return null;
  }
  if (raw.startsWith("/\\")) {
    return null;
  }
  // Reject whitespace + ASCII control characters (anything ≤ U+001F).
  if (/\s/.test(raw) || /[\x00-\x1f]/.test(raw)) {
    return null;
  }
  if (/^\/?[a-z][a-z0-9+.-]*:\/\//i.test(raw)) {
    return null;
  }

  // Split into the path-and-query portion and the fragment.
  const hashIdx = raw.indexOf("#");
  const pathPart = hashIdx === -1 ? raw : raw.slice(0, hashIdx);
  const fragment = hashIdx === -1 ? null : raw.slice(hashIdx + 1);

  // Reject any colon in the path portion (before `?` or `#`) — catches
  // `/javascript:alert(1)` and similar URI-scheme smuggles.
  const pathOnly = pathPart.split("?")[0];
  if (pathOnly.includes(":")) {
    return null;
  }

  if (fragment !== null) {
    // Disallow nested fragments and empty fragment.
    if (fragment.length === 0) {
      return null;
    }
    if (fragment.includes("#")) {
      return null;
    }
    // Allowed fragment alphabet: [A-Za-z0-9-]
    if (!/^[A-Za-z0-9-]+$/.test(fragment)) {
      return null;
    }
  }

  return raw;
}
