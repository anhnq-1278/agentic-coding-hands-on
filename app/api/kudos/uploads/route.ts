import type { NextRequest } from "next/server";
import { jsonError, jsonOk, requireSunner } from "@/lib/kudos/route-helpers";
import {
  ALLOWED_IMAGE_MIMES,
  MAX_IMAGE_BYTES,
  MAX_IMAGE_COUNT,
  type UploadResponse,
} from "@/lib/kudos/uploads.types";

/**
 * Magic-byte sniff for `image/jpeg` (FF D8 FF) and `image/png`
 * (89 50 4E 47). Defence-in-depth on top of the client-declared MIME.
 */
function sniffImageMime(bytes: Uint8Array): string | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    bytes.length >= 4 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "image/png";
  }
  return null;
}

/**
 * `POST /api/kudos/uploads` — multipart endpoint that accepts up to 5
 * `image/jpeg` or `image/png` files (≤5 MB each) and returns a list of
 * data URLs (mock v1). The real backend will swap to object storage
 * with signed URLs; the response shape stays the same.
 */
export async function POST(request: NextRequest) {
  const auth = await requireSunner();
  if (!auth.ok) return auth.response;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return jsonError(400, ["Body must be valid multipart/form-data"]);
  }

  const files: File[] = [];
  for (const value of form.getAll("images")) {
    if (value instanceof File) {
      files.push(value);
    }
  }
  if (files.length === 0) {
    return jsonError(400, ["No image files received"]);
  }
  if (files.length > MAX_IMAGE_COUNT) {
    return jsonError(400, [`At most ${MAX_IMAGE_COUNT} images per upload`]);
  }

  const urls: string[] = [];
  for (const file of files) {
    if (file.size > MAX_IMAGE_BYTES) {
      return jsonError(400, [`File "${file.name}" exceeds 5 MB`]);
    }
    if (!ALLOWED_IMAGE_MIMES.has(file.type)) {
      return jsonError(400, [
        `File "${file.name}" has invalid type "${file.type}"`,
      ]);
    }
    const buf = new Uint8Array(await file.arrayBuffer());
    const sniffed = sniffImageMime(buf);
    if (sniffed === null || !ALLOWED_IMAGE_MIMES.has(sniffed)) {
      return jsonError(400, [
        `File "${file.name}" failed magic-byte validation`,
      ]);
    }
    const base64 = Buffer.from(buf).toString("base64");
    urls.push(`data:${sniffed};base64,${base64}`);
  }

  const response: UploadResponse = { urls };
  return jsonOk(response);
}
