import type { NextRequest } from "next/server";
import { RecipientIsSelfError, sendKudos } from "@/lib/kudos/service";
import { jsonError, jsonOk, requireSunner } from "@/lib/kudos/route-helpers";
import { validateSendKudosBody } from "@/lib/kudos/validators";

export async function POST(request: NextRequest) {
  const auth = await requireSunner();
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, ["Body must be valid JSON"]);
  }
  const valid = validateSendKudosBody(body, auth.viewerId);
  if (!valid.ok) return jsonError(valid.status, valid.errors);

  try {
    const kudos = sendKudos(auth.viewerId, valid.value);
    return jsonOk({ kudos });
  } catch (err) {
    if (err instanceof RecipientIsSelfError) {
      return jsonError(400, ["RECIPIENT_IS_SELF: " + err.message]);
    }
    throw err;
  }
}
