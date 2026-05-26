import Image from "next/image";
import { LoginButton } from "@/components/login/login-button";
import type { getLoginDictionary } from "@/lib/i18n/dictionary";

type Dictionary = ReturnType<typeof getLoginDictionary>;

type Props = {
  dictionary: Dictionary;
  errorMessage: string | null;
};

/**
 * mms_B_Bìa → Frame 487 inner content.
 * Composes the Key Visual (Root Further hero PNG) and Frame 550
 * (description copy + Google login button).
 */
export function LoginHero({ dictionary, errorMessage }: Props) {
  return (
    <div className="flex h-[653px] w-full max-w-[1152px] flex-col justify-center gap-20">
      <div className="flex h-[200px] w-full flex-col gap-6">
        <Image
          src="/assets/login/images/root-further-logo.png"
          alt="Root Further — SAA 2025"
          width={451}
          height={200}
          priority
          className="h-[200px] w-[451px] select-none"
        />
      </div>

      <div className="flex max-w-[496px] flex-col gap-6 pl-4">
        <p
          className="text-[20px] font-bold leading-[40px] tracking-[0.5px] text-saa-text-primary whitespace-pre-line"
          style={{ fontFamily: "var(--font-montserrat), Montserrat, sans-serif" }}
        >
          {dictionary.heroDescription}
        </p>

        <LoginButton label={dictionary.loginButton} />

        {errorMessage && (
          <p
            role="alert"
            className="text-base font-medium text-red-300"
            style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
          >
            {errorMessage}
          </p>
        )}
      </div>
    </div>
  );
}
