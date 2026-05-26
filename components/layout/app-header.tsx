import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/types/auth";
import { AccountMenu } from "@/components/layout/account-menu";
import { AppLanguageSwitch } from "@/components/layout/app-language-switch";
import { NotificationBell } from "@/components/layout/notification-bell";

type NavItem = {
  href: string;
  label: string;
};

type Props = {
  currentPath?: string;
  locale: Locale;
  isAuthenticated?: boolean;
  isAdmin?: boolean;
  userDisplay?: string | null;
  unreadCount?: number;
  accountCopy: {
    profile: string;
    signOut: string;
    adminDashboard: string;
  };
};

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "About SAA 2025" },
  { href: "/awards-information", label: "Award Information" },
  { href: "/sun-kudos", label: "Sun* Kudos" },
];

/**
 * mms_A1_Header. Logo (left) + 3 nav links (center) + bell + language + avatar (right).
 */
export function AppHeader({
  currentPath = "/",
  locale,
  isAuthenticated = true,
  isAdmin = false,
  userDisplay = null,
  unreadCount = 0,
  accountCopy,
}: Props) {
  return (
    <header
      className="absolute inset-x-0 top-0 z-20 flex h-20 items-center justify-between bg-saa-app-header px-36 py-3"
      style={{ backdropFilter: "saturate(120%)" }}
    >
      <div className="flex h-14 items-center gap-16">
        <Link
          href="/"
          aria-label="Sun Annual Awards 2025 — go to homepage"
          className="flex h-12 w-13 items-center"
        >
          <Image
            src="/assets/login/logos/saa-logo.png"
            alt="Sun Annual Awards 2025"
            width={52}
            height={48}
            priority
            className="h-12 w-13 select-none"
          />
        </Link>

        <nav aria-label="Primary" className="flex h-14 items-center gap-6">
          {NAV_ITEMS.map((item) => {
            const selected = currentPath === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={selected ? "page" : undefined}
                className={
                  selected
                    ? "flex items-center gap-1 border-b border-saa-cta-bg p-4 text-saa-cta-bg"
                    : "flex items-center gap-1 rounded-sm p-4 text-saa-text-primary transition-colors hover:bg-white/10"
                }
                style={{
                  fontFamily:
                    "var(--font-montserrat), Montserrat, sans-serif",
                }}
              >
                <span
                  className="text-sm font-bold leading-5 tracking-[0.1px]"
                  style={
                    selected
                      ? {
                          textShadow:
                            "0 4px 4px rgba(0, 0, 0, 0.25), 0 0 6px var(--color-saa-glow)",
                        }
                      : undefined
                  }
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex h-14 items-center gap-4">
        {isAuthenticated && <NotificationBell unreadCount={unreadCount} />}
        <AppLanguageSwitch locale={locale} />
        {isAuthenticated && (
          <AccountMenu
            userDisplay={userDisplay}
            isAdmin={isAdmin}
            copy={accountCopy}
          />
        )}
      </div>
    </header>
  );
}
