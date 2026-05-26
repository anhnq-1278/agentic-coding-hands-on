import Image from "next/image";
import type { Locale } from "@/types/auth";
import { AppLanguageSwitch } from "@/components/layout/app-language-switch";

type Props = {
  locale: Locale;
};

export function Header({ locale }: Props) {
  return (
    <header
      className="absolute inset-x-0 top-0 z-20 flex h-20 items-center justify-between bg-saa-header px-[144px] py-3"
      style={{ backdropFilter: "saturate(120%)" }}
    >
      {/* mms_A.1_Logo — Sun Annual Awards 2025 (decorative, non-interactive) */}
      <div className="flex h-14 items-center">
        <Image
          src="/assets/login/logos/saa-logo.png"
          alt="Sun Annual Awards 2025"
          width={52}
          height={48}
          priority
          className="h-12 w-[52px] select-none"
        />
      </div>

      {/* mms_A.2_Language — clicking the pill opens a vi/en dropdown
          that writes the `saa-locale` cookie via `setLocaleAction` and
          re-renders the page in the chosen language. */}
      <AppLanguageSwitch locale={locale} />
    </header>
  );
}
