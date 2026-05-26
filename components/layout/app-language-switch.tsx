"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useTransition } from "react";
import type { Locale } from "@/types/auth";
import { setLocaleAction } from "@/actions/set-locale";

type Props = {
  locale: Locale;
};

const OPTIONS: { value: Locale; label: string; flag: string }[] = [
  {
    value: "vi",
    label: "VN",
    flag: "/assets/login/icons/flag-vn.svg",
  },
  {
    value: "en",
    label: "EN",
    flag: "/assets/login/icons/flag-en.svg",
  },
];

/**
 * mms_A1.7_Language — interactive language switch backed by `setLocaleAction`.
 */
export function AppLanguageSwitch({ locale }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
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

  const current = OPTIONS.find((o) => o.value === locale) ?? OPTIONS[0];

  function handleSelect(next: Locale) {
    setOpen(false);
    if (next === locale) return;
    startTransition(() => {
      void setLocaleAction(next);
    });
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Change language"
        disabled={isPending}
        onClick={() => setOpen((v) => !v)}
        className="flex h-14 w-27 items-center justify-between gap-0.5 rounded-sm p-4 text-saa-text-primary transition-colors hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40 disabled:opacity-60"
      >
        <span className="flex items-center gap-1">
          <Image
            src={current.flag}
            alt=""
            width={24}
            height={24}
            className="h-6 w-6"
          />
          <span
            className="text-base font-bold leading-6 tracking-[0.15px]"
            style={{
              fontFamily:
                "Montserrat, var(--font-montserrat), sans-serif",
            }}
          >
            {current.label}
          </span>
        </span>
        <Image
          src="/assets/login/icons/chevron-down.svg"
          alt=""
          width={24}
          height={24}
          className="h-6 w-6"
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Language"
          className="absolute right-0 top-[68px] z-50 flex w-30 flex-col gap-0 rounded-lg border border-[#998C5F] bg-[#00070C] p-1.5 shadow-xl"
        >
          {OPTIONS.map((option) => {
            const isSelected = option.value === locale;
            return (
              <li key={option.value} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(option.value)}
                  className={`flex h-14 w-full items-center gap-2 rounded-sm px-4 text-left text-saa-text-primary transition-colors ${
                    isSelected
                      ? "bg-[rgba(255,234,158,0.20)]"
                      : "hover:bg-white/5"
                  }`}
                >
                  <Image
                    src={option.flag}
                    alt=""
                    width={24}
                    height={24}
                    className="h-6 w-6"
                  />
                  <span
                    className="text-base font-bold leading-6 tracking-[0.15px]"
                    style={{
                      fontFamily:
                        "Montserrat, var(--font-montserrat), sans-serif",
                    }}
                  >
                    {option.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
