import { listDepartments } from "@/lib/kudos/service";
import { jsonOk, requireSunner } from "@/lib/kudos/route-helpers";

export async function GET() {
  const auth = await requireSunner();
  if (!auth.ok) return auth.response;
  return jsonOk({ items: listDepartments() });
}
