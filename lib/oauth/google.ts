import { Google } from "arctic";

/**
 * Arctic Google client. The redirect URI is built from the live request
 * `origin` so dev servers running on whatever port `next dev` picks
 * (3000, 3001, 3002…) all work without touching env vars — provided
 * each origin is registered as an Authorized Redirect URI on the Google
 * Cloud OAuth client.
 *
 * `NEXT_PUBLIC_SITE_URL` is kept as a fallback for environments that
 * don't have a request context (e.g. background jobs); in normal sign-in
 * /callback flow the caller passes `origin`.
 */
export function createGoogleClient(origin?: string): Google {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const baseUrl = origin ?? process.env.NEXT_PUBLIC_SITE_URL;

  if (!clientId || !clientSecret || !baseUrl) {
    throw new Error(
      "Missing GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, or request origin / NEXT_PUBLIC_SITE_URL.",
    );
  }

  return new Google(clientId, clientSecret, `${baseUrl}/auth/callback`);
}

/** Re-export Arctic helpers so the rest of the app can import from one place. */
export {
  generateState,
  generateCodeVerifier,
  decodeIdToken,
} from "arctic";

export const GOOGLE_OAUTH_SCOPES = ["openid", "profile", "email"];

export type GoogleIdTokenClaims = {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  hd?: string;
};
