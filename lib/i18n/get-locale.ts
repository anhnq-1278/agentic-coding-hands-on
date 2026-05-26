import { cookies } from "next/headers";
import type { Locale } from "@/types/auth";
import { DEFAULT_LOCALE } from "@/lib/i18n/dictionary";

const LOCALE_COOKIE = "saa-locale";
const SUPPORTED: ReadonlySet<Locale> = new Set(["vi", "en"] as const);

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LOCALE_COOKIE)?.value as Locale | undefined;
  return value && SUPPORTED.has(value) ? value : DEFAULT_LOCALE;
}

export const LOCALE_COOKIE_NAME = LOCALE_COOKIE;
