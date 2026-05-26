import type { NextRequest } from "next/server";
import {
  HeartSelfBlockError,
  KudosNotFoundError,
  toggleHeart,
} from "@/lib/kudos/service";
import { jsonError, jsonOk, requireSunner } from "@/lib/kudos/route-helpers";
import { validateHeartBody } from "@/lib/kudos/validators";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ kudosId: string }> },
) {
  const auth = await requireSunner();
  if (!auth.ok) return auth.response;

  const { kudosId } = await params;
  if (!kudosId || kudosId.length === 0) {
    return jsonError(400, ["kudosId is required"]);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, ["Body must be valid JSON"]);
  }
  const valid = validateHeartBody(body);
  if (!valid.ok) return jsonError(valid.status, valid.errors);

  try {
    const result = toggleHeart(auth.viewerId, kudosId, valid.value.next);
    return jsonOk(result);
  } catch (err) {
    if (err instanceof HeartSelfBlockError) {
      return jsonError(403, [err.message]);
    }
    if (err instanceof KudosNotFoundError) {
      return jsonError(404, [err.message]);
    }
    throw err;
  }
}
