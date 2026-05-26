import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  createGoogleClient,
  decodeIdToken,
  type GoogleIdTokenClaims,
} from "@/lib/oauth/google";
import { assertEmailAllowed } from "@/lib/auth/auth-service";
import { AuthError, AuthErrorCode } from "@/lib/auth/errors";
import {
  createSessionJwt,
  OAUTH_STATE_COOKIE,
  OAUTH_VERIFIER_COOKIE,
  SESSION_COOKIE_NAME,
  SESSION_TTL_SECONDS,
} from "@/lib/auth/session";
import { PRELAUNCH_RETURN_TO_COOKIE } from "@/lib/middleware/prelaunch-gate";
import { validateReturnTo } from "@/lib/auth/return-to";

function clearOAuthCookies(response: NextResponse): NextResponse {
  response.cookies.delete(OAUTH_STATE_COOKIE);
  response.cookies.delete(OAUTH_VERIFIER_COOKIE);
  return response;
}

function redirectWithError(
  origin: string,
  code: AuthErrorCode,
): NextResponse {
  const url = new URL("/login", origin);
  url.searchParams.set("error", code);
  return clearOAuthCookies(NextResponse.redirect(url));
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const cookieStore = await cookies();
  const expectedState = cookieStore.get(OAUTH_STATE_COOKIE)?.value;
  const codeVerifier = cookieStore.get(OAUTH_VERIFIER_COOKIE)?.value;

  if (!code || !state || !expectedState || !codeVerifier) {
    return redirectWithError(url.origin, AuthErrorCode.MISSING_CODE);
  }
  if (state !== expectedState) {
    return redirectWithError(url.origin, AuthErrorCode.OAUTH_FAILED);
  }

  let claims: GoogleIdTokenClaims;
  try {
    const google = createGoogleClient(url.origin);
    const tokens = await google.validateAuthorizationCode(code, codeVerifier);
    claims = decodeIdToken(tokens.idToken()) as GoogleIdTokenClaims;
  } catch {
    return redirectWithError(url.origin, AuthErrorCode.OAUTH_FAILED);
  }

  try {
    assertEmailAllowed(claims.email);
  } catch (err) {
    if (err instanceof AuthError && err.code === AuthErrorCode.DOMAIN_NOT_ALLOWED) {
      return clearOAuthCookies(
        NextResponse.redirect(new URL("/403", url.origin)),
      );
    }
    return redirectWithError(url.origin, AuthErrorCode.OAUTH_FAILED);
  }

  const email = claims.email!;
  const sessionJwt = await createSessionJwt({
    userId: claims.sub,
    email,
    displayName: claims.name ?? null,
    avatarUrl: claims.picture ?? null,
    domain: email.slice(email.lastIndexOf("@") + 1).toLowerCase(),
  });

  // Consume a previously-set `saa-returnTo` cookie if present and valid.
  const returnToRaw = cookieStore.get(PRELAUNCH_RETURN_TO_COOKIE)?.value;
  const validatedReturnTo = validateReturnTo(returnToRaw);
  const redirectTarget = validatedReturnTo
    ? new URL(validatedReturnTo, url.origin)
    : new URL("/", url.origin);

  const response = NextResponse.redirect(redirectTarget);
  response.cookies.set(SESSION_COOKIE_NAME, sessionJwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  // Clear the consumed returnTo cookie so a stale value doesn't redirect a
  // future sign-in.
  response.cookies.delete(PRELAUNCH_RETURN_TO_COOKIE);
  return clearOAuthCookies(response);
}
