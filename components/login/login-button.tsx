import Image from "next/image";

type Props = {
  label: string;
};

/**
 * mms_B.3_Login → Button-IC About.
 * Uses a plain `<a>` so the browser does a full HTTP navigation to the
 * OAuth start route. `<Link>` is unsafe here: its client-side router
 * cannot follow the 302 to `accounts.google.com`, and its prefetch
 * would burn the state/PKCE cookies before the user clicks.
 */
export function LoginButton({ label }: Props) {
  return (
    <a
      href="/auth/sign-in/google"
      aria-label="Sign in with Google"
      className="flex h-[60px] w-[305px] items-center justify-start gap-2 rounded-lg bg-saa-cta-bg px-6 py-4 text-saa-cta-text shadow-sm transition-shadow duration-150 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40"
    >
      <span className="flex h-7 items-center gap-1">
        <span
          className="text-[22px] font-bold leading-7 tracking-normal"
          style={{ fontFamily: "var(--font-montserrat), Montserrat, sans-serif" }}
        >
          {label}
        </span>
      </span>

      <Image
        src="/assets/login/icons/google-icon.svg"
        alt=""
        width={24}
        height={24}
        className="h-6 w-6"
      />
    </a>
  );
}
