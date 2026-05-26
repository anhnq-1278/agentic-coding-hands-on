import type { NextRequest } from "next/server";
import { getHighlights } from "@/lib/kudos/service";
import { jsonError, jsonOk, requireSunner } from "@/lib/kudos/route-helpers";
import { validateFilters } from "@/lib/kudos/validators";

export async function GET(request: NextRequest) {
  const auth = await requireSunner();
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const filters = validateFilters(
    url.searchParams.get("hashtag"),
    url.searchParams.get("department"),
  );
  if (!filters.ok) return jsonError(filters.status, filters.errors);

  const items = getHighlights(filters.value, auth.viewerId);
  return jsonOk({ items });
}
