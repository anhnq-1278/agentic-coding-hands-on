import { openSecretBox } from "@/lib/kudos/service";
import { jsonError, jsonOk, requireSunner } from "@/lib/kudos/route-helpers";

export async function POST() {
  const auth = await requireSunner();
  if (!auth.ok) return auth.response;

  const result = openSecretBox(auth.viewerId);
  if (!result.box) {
    return jsonError(404, ["No pending secret boxes."]);
  }
  return jsonOk({ box: result.box });
}
