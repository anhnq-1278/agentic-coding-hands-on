/**
 * Shared types + constants for the Kudos image upload endpoint.
 *
 * In v1 the endpoint is a single-process mock that echoes data URLs
 * back to the client. The real backend will swap to object storage; the
 * response shape (`{ urls: string[] }`) stays the same so the client
 * doesn't change.
 */
export type UploadResponse = {
  urls: string[];
};

/** Per spec FR-007 / plan §3 — 5 MB per image. */
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** Per spec FR-007 — max 5 images per request. */
export const MAX_IMAGE_COUNT = 5;

/** Allowed MIME types per spec FR-007. Server-side magic-byte check
 *  validates these without trusting the client-declared Content-Type. */
export const ALLOWED_IMAGE_MIMES = new Set<string>([
  "image/jpeg",
  "image/png",
]);
