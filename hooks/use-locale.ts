"use client";

import { useCallback, useState } from "react";
import type { Locale } from "@/types/auth";

const LOCALE_COOKIE = "saa-locale";
const ONE_YEAR = 60 * 60 * 24 * 365;

export function useLocale(initial: Locale): {
  locale: Locale;
  setLocale: (next: Locale) => void;
} {
  const [locale, setLocaleState] = useState<Locale>(initial);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    if (typeof document !== "undefined") {
      document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
    }
  }, []);

  return { locale, setLocale };
}
