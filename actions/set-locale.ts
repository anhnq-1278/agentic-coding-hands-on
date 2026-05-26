"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import type { Locale } from "@/types/auth";
import { LOCALE_COOKIE_NAME } from "@/lib/i18n/get-locale";

const SUPPORTED: ReadonlySet<Locale> = new Set(["vi", "en"] as const);
const ONE_YEAR = 60 * 60 * 24 * 365;

export async function setLocaleAction(rawLocale: string): Promise<void> {
  if (!SUPPORTED.has(rawLocale as Locale)) {
    throw new Error(`Unsupported locale: ${rawLocale}`);
  }
  const locale = rawLocale as Locale;

  const store = await cookies();
  store.set(LOCALE_COOKIE_NAME, locale, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: ONE_YEAR,
  });

  // Re-render every server-rendered route so localized copy refreshes.
  revalidatePath("/", "layout");
}
