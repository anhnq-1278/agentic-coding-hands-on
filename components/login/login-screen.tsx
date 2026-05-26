import Image from "next/image";
import type { Locale } from "@/types/auth";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { LoginHero } from "@/components/login/login-hero";
import type { getLoginDictionary } from "@/lib/i18n/dictionary";

type Dictionary = ReturnType<typeof getLoginDictionary>;

type Props = {
  locale: Locale;
  dictionary: Dictionary;
  errorMessage: string | null;
};

export function LoginScreen({ locale, dictionary, errorMessage }: Props) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-saa-bg text-saa-text-primary">
      {/* mms_C_Keyvisual — full-bleed background artwork (decorative) */}
      <Image
        src="/assets/login/images/keyvisual-bg.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="pointer-events-none z-0 select-none object-cover"
      />

      {/* Rectangle 57 — left-to-right vignette (dark left → transparent right) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(90deg, #00101A 0%, #00101A 25.41%, rgba(0, 16, 26, 0) 100%)",
        }}
      />

      {/* Cover — bottom-to-top vignette (transparent top → dark bottom) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[138px] z-[1] h-[1093px]"
        style={{
          background:
            "linear-gradient(0deg, #00101A 22.48%, rgba(0, 19, 32, 0) 51.74%)",
        }}
      />

      <div className="relative z-10 flex min-h-screen flex-col">
        <Header locale={locale} />
        <main className="flex flex-1 flex-col gap-[120px] px-[144px] pt-[96px] pb-[96px]">
          <LoginHero dictionary={dictionary} errorMessage={errorMessage} />
        </main>
        <Footer copyright={dictionary.copyright} />
      </div>
    </div>
  );
}
