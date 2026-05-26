import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";

/**
 * Lightweight session probe used by the Countdown takeover at T-0 to decide
 * between `/login` (no session) and `/` (authenticated). Always uncached:
 * the decision drives navigation.
 */
export async function GET() {
  const user = await getCurrentUser();
  return NextResponse.json(
    { authenticated: user !== null },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
