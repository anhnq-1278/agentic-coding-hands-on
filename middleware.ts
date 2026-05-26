import { NextResponse, type NextRequest } from "next/server";
import { readSessionJwt, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { applyPrelaunchGate } from "@/lib/middleware/prelaunch-gate";

const PUBLIC_ROUTE_PREFIXES = [
  "/login",
  "/auth",
  "/403",
  "/community-standards",
  "/countdown",
];

const PUBLIC_EXACT_ROUTES = new Set(["/"]);

export async function middleware(request: NextRequest) {
  // Pre-launch gate runs FIRST. While `EVENT_START_AT` is in the future, every
  // non-asset / non-API path is rewritten to `/countdown` (with optional
  // returnTo cookie for authed visitors). Admins bypass the gate.
  const gateResponse = await applyPrelaunchGate(request);
  if (gateResponse) {
    return gateResponse;
  }

  // After T-0 (or when the gate is failed-open), apply the existing auth flow.
  const cookieValue = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const user = cookieValue ? await readSessionJwt(cookieValue) : null;

  const pathname = request.nextUrl.pathname;
  const isPublic =
    PUBLIC_EXACT_ROUTES.has(pathname) ||
    PUBLIC_ROUTE_PREFIXES.some((p) => pathname.startsWith(p));

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|assets/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
