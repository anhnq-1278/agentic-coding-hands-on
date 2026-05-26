import { NextResponse } from "next/server";
import {
  createGoogleClient,
  generateCodeVerifier,
  generateState,
  GOOGLE_OAUTH_SCOPES,
} from "@/lib/oauth/google";
import {
  OAUTH_FLOW_TTL_SECONDS,
  OAUTH_STATE_COOKIE,
  OAUTH_VERIFIER_COOKIE,
} from "@/lib/auth/session";

/**
 * Begin the Google OAuth flow. Generates `state` (CSRF guard) and a PKCE
 * `code_verifier`, stashes both in HttpOnly cookies, then 302-redirects the
 * browser to Google. The callback handler reads the cookies back to validate
 * the response.
 */
export async function GET(request: Request) {
  const google = createGoogleClient(new URL(request.url).origin);

  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const url = google.createAuthorizationURL(
    state,
    codeVerifier,
    GOOGLE_OAUTH_SCOPES,
  );

  const response = NextResponse.redirect(url);
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: OAUTH_FLOW_TTL_SECONDS,
  };
  response.cookies.set(OAUTH_STATE_COOKIE, state, cookieOptions);
  response.cookies.set(OAUTH_VERIFIER_COOKIE, codeVerifier, cookieOptions);
  return response;
}
