import type { NextRequest } from "next/server";
import { listFeed } from "@/lib/kudos/service";
import { jsonError, jsonOk, requireSunner } from "@/lib/kudos/route-helpers";
import {
  validateCursorAndLimit,
  validateFilters,
} from "@/lib/kudos/validators";

export async function GET(request: NextRequest) {
  const auth = await requireSunner();
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const filters = validateFilters(
    url.searchParams.get("hashtag"),
    url.searchParams.get("department"),
  );
  if (!filters.ok) return jsonError(filters.status, filters.errors);

  const pager = validateCursorAndLimit(
    url.searchParams.get("cursor"),
    url.searchParams.get("limit"),
  );
  if (!pager.ok) return jsonError(pager.status, pager.errors);

  const page = listFeed(
    filters.value,
    pager.value.cursor,
    pager.value.limit,
    auth.viewerId,
  );
  return jsonOk(page);
}
