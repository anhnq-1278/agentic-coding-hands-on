import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getViewerId } from "@/lib/kudos/service";
import type { SunnerId } from "@/lib/kudos/types";

/**
 * Shared 401-or-resolve helper for `/api/kudos/*` and `/api/users/me`
 * route handlers. Returns the resolved viewer Sunner id when authenticated,
 * or a NextResponse(401) when not.
 */
export async function requireSunner(): Promise<
  | { ok: true; viewerId: SunnerId; email: string }
  | { ok: false; response: NextResponse }
> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: { "Cache-Control": "no-store, max-age=0" } },
      ),
    };
  }
  return { ok: true, viewerId: getViewerId(user.email), email: user.email };
}

export function jsonError(
  status: number,
  errors: readonly string[],
): NextResponse {
  return NextResponse.json(
    { error: errors[0] ?? "Bad Request", details: errors },
    { status, headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}

export function jsonOk<T>(data: T): NextResponse {
  return NextResponse.json(data, {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}
