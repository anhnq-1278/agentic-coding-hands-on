import { getSidebarStats } from "@/lib/kudos/service";
import { jsonError, jsonOk, requireSunner } from "@/lib/kudos/route-helpers";

export async function GET() {
  const auth = await requireSunner();
  if (!auth.ok) return auth.response;
  const stats = getSidebarStats(auth.viewerId);
  if (!stats) return jsonError(404, ["Sunner profile not found"]);
  return jsonOk(stats);
}
