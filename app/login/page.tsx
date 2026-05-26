import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginScreen } from "@/components/login/login-screen";
import { getCurrentUser } from "@/lib/auth/session";
import { getLocale } from "@/lib/i18n/get-locale";
import { getLoginDictionary } from "@/lib/i18n/dictionary";
import { AuthErrorCode } from "@/lib/auth/errors";

export const metadata: Metadata = {
  title: "Login — Sun Annual Awards 2025",
  description: "Sign in to the Sun Annual Awards 2025 application.",
};

type SearchParams = Promise<{ error?: string }>;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  // US2 — auto-redirect already-authenticated users without rendering the form.
  const user = await getCurrentUser();
  if (user) {
    redirect("/");
  }

  const [locale, params] = await Promise.all([getLocale(), searchParams]);
  const dictionary = getLoginDictionary(locale);

  let errorMessage: string | null = null;
  switch (params?.error) {
    case AuthErrorCode.OAUTH_FAILED:
    case AuthErrorCode.MISSING_CODE:
      errorMessage = dictionary.errors.oauthFailed;
      break;
    case AuthErrorCode.SESSION_EXPIRED:
      errorMessage = dictionary.errors.sessionExpired;
      break;
    default:
      errorMessage = null;
  }

  return (
    <LoginScreen
      locale={locale}
      dictionary={dictionary}
      errorMessage={errorMessage}
    />
  );
}
