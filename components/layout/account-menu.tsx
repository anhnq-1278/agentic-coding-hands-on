"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Props = {
  userDisplay?: string | null;
  isAdmin?: boolean;
  copy: {
    profile: string;
    signOut: string;
    adminDashboard: string;
  };
};

/**
 * mms_A1.8_Button-IC — avatar dropdown.
 * Regular user: Profile + Sign out. Admin: + Admin Dashboard.
 */
export function AccountMenu({ userDisplay, isAdmin = false, copy }: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-10 items-center justify-center rounded-sm border border-saa-border text-saa-text-primary transition-colors hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-12 z-50 flex w-56 flex-col gap-1 rounded-md border border-saa-border bg-saa-bg p-2 shadow-xl"
        >
          {userDisplay && (
            <p
              className="truncate px-3 py-2 text-sm text-saa-text-muted"
              role="presentation"
            >
              {userDisplay}
            </p>
          )}
          <Link
            href="/profile"
            role="menuitem"
            className="rounded px-3 py-2 text-sm text-saa-text-primary transition-colors hover:bg-white/5"
            onClick={() => setOpen(false)}
          >
            {copy.profile}
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              role="menuitem"
              className="rounded px-3 py-2 text-sm text-saa-text-primary transition-colors hover:bg-white/5"
              onClick={() => setOpen(false)}
            >
              {copy.adminDashboard}
            </Link>
          )}
          <form action="/auth/sign-out" method="post">
            <button
              type="submit"
              role="menuitem"
              className="w-full rounded px-3 py-2 text-left text-sm text-saa-text-primary transition-colors hover:bg-white/5"
            >
              {copy.signOut}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
