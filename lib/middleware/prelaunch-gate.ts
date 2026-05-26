import { NextResponse, type NextRequest } from "next/server";
import { isPrelaunch } from "@/lib/events/get-event";
import { isAdminEmail } from "@/lib/auth/admin-roles";
import {
  readSessionJwt,
  SESSION_COOKIE_NAME,
} from "@/lib/auth/session";
import { validateReturnTo } from "@/lib/auth/return-to";

export const PRELAUNCH_RETURN_TO_COOKIE = "saa-returnTo";
const PRELAUNCH_RETURN_TO_TTL = 60 * 60 * 24; // 1 day

/**
 * Paths that MUST pass through the gate even while pre-launch:
 *  - `/countdown` — the takeover page itself.
 *  - `/_next/*`, `/assets/*` — static asset routes (the takeover needs them).
 *  - `/api/*` — server routes (including `/api/auth/status` used by the unlock).
 *  - `/favicon.ico` — browser request, harmless.
 */
const PRELAUNCH_PUBLIC_PREFIXES = [
  "/countdown",
  "/_next",
  "/assets",
  "/api",
];

function isPrelaunchPublic(pathname: string): boolean {
  if (pathname === "/favicon.ico") return true;
  return PRELAUNCH_PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
}

/**
 * Decides whether the request should be diverted to the Countdown takeover.
 * Returns a NextResponse to short-circuit the rest of the middleware, or
 * `null` to let the next layer (auth) handle it.
 *
 * **Fail-open**: a malformed `EVENT_START_AT` env causes `isPrelaunch()` to
 * return false; the gate is then off and the existing auth flow runs.
 */
export async function applyPrelaunchGate(
  request: NextRequest,
): Promise<NextResponse | null> {
  if (!isPrelaunch()) {
    return null;
  }

  const pathname = request.nextUrl.pathname;
  if (isPrelaunchPublic(pathname)) {
    return null;
  }

  // Read the session JWT for admin bypass + returnTo cookie write.
  const cookieValue = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const user = cookieValue ? await readSessionJwt(cookieValue) : null;

  // Admin bypass: admins reach the requested page directly (banner is
  // rendered by the page chrome).
  if (user && isAdminEmail(user.email)) {
    return null;
  }

  // Everyone else gets the takeover.
  const target = request.nextUrl.clone();
  target.pathname = "/countdown";
  const response = NextResponse.rewrite(target);

  // For authed visitors, preserve where they were going so the takeover can
  // route them there at T-0. Anonymous visitors always go to `/login` at T-0,
  // so there's no point persisting a returnTo for them.
  if (user) {
    const validated = validateReturnTo(pathname + request.nextUrl.search);
    if (validated) {
      response.cookies.set(PRELAUNCH_RETURN_TO_COOKIE, validated, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: PRELAUNCH_RETURN_TO_TTL,
      });
    }
  }

  return response;
}
