import type { Metadata } from "next";
import Link from "next/link";
import { getLocale } from "@/lib/i18n/get-locale";
import { getLoginDictionary } from "@/lib/i18n/dictionary";

export const metadata: Metadata = {
  title: "Access denied — Sun Annual Awards 2025",
  description: "This account is not allowed to access SAA 2025.",
};

/**
 * Placeholder for Error page 403 (Figma frame `T3e_iS9PCL`).
 * Reached when an OAuth flow succeeds with a Google account whose email
 * domain is outside the Sun* whitelist. The full design is owned by the
 * dedicated 403 frame spec.
 */
export default async function ForbiddenPage() {
  const locale = await getLocale();
  const dict = getLoginDictionary(locale);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-saa-bg px-6 py-16 text-saa-text-primary">
      <div className="flex max-w-xl flex-col items-center gap-6 text-center">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-saa-text-muted">
          403
        </p>
        <h1 className="text-3xl font-bold tracking-tight">
          {dict.errors.domainNotAllowed}
        </h1>
        <Link
          href="/login"
          className="rounded-md bg-saa-cta-bg px-5 py-2 text-base font-bold text-saa-cta-text transition-shadow hover:shadow-lg"
        >
          {locale === "en" ? "Back to sign-in" : "Quay lại đăng nhập"}
        </Link>
      </div>
    </main>
  );
}
