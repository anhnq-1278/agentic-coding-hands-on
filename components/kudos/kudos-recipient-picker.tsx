"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useSunnerLookup } from "@/hooks/use-sunner-lookup";
import type {
  ComposerErrorMap,
  RecipientSelection,
} from "@/hooks/use-kudos-composer";

type Props = {
  label: string;
  placeholder: string;
  query: string;
  recipient: RecipientSelection;
  viewerId: string;
  error: ComposerErrorMap["recipient"];
  copy: {
    requiredError: string;
    freeFormError: string;
    selfError: string;
    noResults: string;
  };
  onQueryChange: (q: string) => void;
  onSelect: (r: RecipientSelection) => void;
};

/**
 * `B_Chọn người nhận` block (Figma `I520:11647;520:9871`):
 *   - `B.1_Title` label "Chọn người nhận"
 *   - `B.2_Search` autocomplete input (pill, border `#998C5F`, bg 10%
 *     yellow, search icon)
 *
 * Dropdown lists Sunners from `/api/kudos/sunners` filtered case-
 * insensitive + accent-insensitive, excluding the sender. Selecting an
 * item fills the input and stores the Sunner id in composer state.
 */
export function KudosRecipientPicker({
  label,
  placeholder,
  query,
  recipient,
  viewerId,
  error,
  copy,
  onQueryChange,
  onSelect,
}: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const results = useSunnerLookup({
    query,
    excludeSenderId: viewerId,
    limit: 8,
  });

  // Close on outside click / Esc.
  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [open]);

  const errorMessage =
    error === "REQUIRED"
      ? copy.requiredError
      : error === "FREE_FORM"
        ? copy.freeFormError
        : error === "SELF"
          ? copy.selfError
          : null;

  return (
    <div className="flex w-full flex-col gap-1">
      <div className="flex w-full items-center gap-6">
        <label
          htmlFor="kudos-recipient-input"
          className="w-32 shrink-0 text-base font-bold leading-6 text-[#00101A]"
        >
          {label}
          <span className="ml-1 text-[#D4271D]">*</span>
        </label>
        <div ref={containerRef} className="relative flex-1">
          <input
            ref={inputRef}
            id="kudos-recipient-input"
            type="text"
            value={query}
            placeholder={placeholder}
            onChange={(e) => {
              onQueryChange(e.target.value);
              setOpen(true);
              if (
                recipient !== null &&
                e.target.value !== recipient.displayName
              ) {
                onSelect(null);
              }
            }}
            onFocus={() => setOpen(true)}
            aria-invalid={Boolean(errorMessage)}
            aria-describedby={
              errorMessage ? "kudos-recipient-error" : undefined
            }
            className={`w-full rounded-lg border bg-white px-6 py-4 pr-10 text-base font-medium text-[#00101A] placeholder:text-[#999999] focus:outline-none focus:ring-2 focus:ring-saa-cta-bg ${
              errorMessage ? "border-[#D4271D]" : "border-[#998C5F]"
            }`}
          />
          <ChevronDown />
          {open && (
            <ul
              role="listbox"
              className="absolute left-0 right-0 top-full z-30 mt-2 max-h-72 overflow-y-auto rounded-xl border border-[#998C5F] bg-white p-1 shadow-xl"
            >
              {results.length === 0 ? (
                <li className="px-3 py-2 text-sm text-[#666666]">
                  {copy.noResults}
                </li>
              ) : (
                results.map((sunner) => (
                  <li key={sunner.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={recipient?.id === sunner.id}
                      onClick={() => {
                        onSelect({
                          id: sunner.id,
                          displayName: sunner.displayName,
                        });
                        setOpen(false);
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-saa-cta-bg/20"
                    >
                      <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full ring-1 ring-[#998C5F]">
                        <Image
                          src={sunner.avatarUrl}
                          alt=""
                          fill
                          sizes="32px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate text-sm font-bold text-[#00101A]">
                          {sunner.displayName}
                        </span>
                        <span className="truncate text-xs text-[#666666]">
                          {sunner.title} · {sunner.departmentName}
                        </span>
                      </div>
                    </button>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      </div>
      {errorMessage && (
        <p
          id="kudos-recipient-error"
          role="alert"
          className="ml-[152px] text-sm font-medium text-[#D4271D]"
        >
          {errorMessage}
        </p>
      )}
    </div>
  );
}

function ChevronDown() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="#00101A"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
