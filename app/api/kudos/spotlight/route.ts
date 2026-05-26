import type { NextRequest } from "next/server";
import { getSpotlightNodes } from "@/lib/kudos/service";
import { jsonError, jsonOk, requireSunner } from "@/lib/kudos/route-helpers";
import {
  validateFilters,
  validateSearchQuery,
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

  const query = validateSearchQuery(url.searchParams.get("q"));
  if (!query.ok) return jsonError(query.status, query.errors);

  const nodes = getSpotlightNodes(filters.value, query.value);
  return jsonOk({ nodes, total: nodes.length });
}
