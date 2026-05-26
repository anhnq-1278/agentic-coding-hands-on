"use client";

import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import type { ComposerErrorMap } from "@/hooks/use-kudos-composer";
import type { Hashtag } from "@/lib/kudos/types";

type Props = {
  label: string;
  buttonLabel: string;
  searchPlaceholder: string;
  helperText: string;
  values: readonly string[];
  error: ComposerErrorMap["hashtags"];
  copy: {
    requiredError: string;
    duplicateError: string;
    maxError: string;
    createOption: string;
    noResults: string;
  };
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
};

async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as T;
}

const MAX_HASHTAGS = 5;
const MAX_LABEL = "Tối đa 5";

/**
 * `E_Frame 536` hashtag block (Figma `I520:11647;520:9890`):
 *   - Left: label "Hashtag*"
 *   - Right: white outlined `+ Hashtag` button with "Tối đa 5" subline,
 *     followed by the chip row when tags are selected.
 */
export function KudosHashtagPicker({
  label,
  buttonLabel,
  searchPlaceholder,
  values,
  error,
  copy,
  onAdd,
  onRemove,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hashtags = useSWR<{ items: readonly Hashtag[] }>(
    "/api/kudos/hashtags",
    fetcher,
    { revalidateOnFocus: false },
  );

  const atCap = values.length >= MAX_HASHTAGS;

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
      : error === "DUPLICATE"
        ? copy.duplicateError
        : error === "MAX"
          ? copy.maxError
          : null;

  const selectedSet = new Set(values.map((t) => t.toLowerCase()));
  const matches = (hashtags.data?.items ?? []).filter((tag) => {
    if (selectedSet.has(tag.tag.toLowerCase())) return false;
    if (query.length === 0) return true;
    return tag.tag.toLowerCase().includes(query.toLowerCase());
  });
  const showCreateNew =
    query.trim().length > 0 &&
    !matches.some((t) => t.tag.toLowerCase() === query.trim().toLowerCase()) &&
    !selectedSet.has(query.trim().toLowerCase());

  function handleAdd(tag: string): void {
    onAdd(tag);
    setQuery("");
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="flex w-full items-start gap-6">
      <label className="w-32 shrink-0 pt-4 text-base font-bold leading-6 text-[#00101A]">
        {label}
        <span className="ml-1 text-[#D4271D]">*</span>
      </label>
      <div className="flex flex-1 flex-wrap items-center gap-3">
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            disabled={atCap}
            aria-expanded={open}
            aria-haspopup="listbox"
            title={atCap ? copy.maxError : undefined}
            className={`flex h-14 flex-col items-center justify-center rounded-lg border bg-white px-5 transition-colors ${
              atCap
                ? "cursor-not-allowed opacity-50"
                : "hover:border-saa-cta-bg"
            } ${errorMessage ? "border-[#D4271D]" : "border-[#998C5F]"}`}
          >
            <span className="text-base font-bold text-[#00101A]">
              <span className="mr-1">+</span>
              {buttonLabel.replace(/^\+\s*/, "")}
            </span>
            <span className="text-xs font-medium text-[#999999]">
              {MAX_LABEL}
            </span>
          </button>
          {open && !atCap && (
            <div
              role="listbox"
              className="absolute left-0 top-full z-30 mt-2 w-72 rounded-xl border border-[#998C5F] bg-white p-2 shadow-xl"
            >
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
                className="mb-2 h-9 w-full rounded-md border border-[#998C5F] bg-white px-2 text-sm text-[#00101A] placeholder:text-[#999999] focus:border-saa-cta-bg focus:outline-none"
              />
              <ul className="flex max-h-48 flex-col gap-0.5 overflow-y-auto">
                {matches.map((tag) => (
                  <li key={tag.tag}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={false}
                      onClick={() => handleAdd(tag.tag)}
                      className="block w-full rounded-md px-3 py-1.5 text-left text-sm text-[#00101A] transition-colors hover:bg-saa-cta-bg/20"
                    >
                      #{tag.tag}
                    </button>
                  </li>
                ))}
                {showCreateNew && (
                  <li>
                    <button
                      type="button"
                      role="option"
                      aria-selected={false}
                      onClick={() => handleAdd(query.trim())}
                      className="block w-full rounded-md px-3 py-1.5 text-left text-sm font-bold text-[#D4271D] transition-colors hover:bg-saa-cta-bg/20"
                    >
                      {copy.createOption.replace(
                        "{input}",
                        query.trim(),
                      )}
                    </button>
                  </li>
                )}
                {matches.length === 0 && !showCreateNew && (
                  <li className="px-3 py-1.5 text-sm text-[#999999]">
                    {copy.noResults}
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
        {values.map((tag) => (
          <span
            key={tag}
            className="inline-flex h-9 items-center gap-1 rounded-full border border-[#998C5F] bg-white px-3 text-sm font-bold text-[#D4271D]"
          >
            #{tag}
            <button
              type="button"
              aria-label={`Remove ${tag}`}
              onClick={() => onRemove(tag)}
              className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full text-[#00101A] transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saa-cta-bg"
            >
              ×
            </button>
          </span>
        ))}
        {errorMessage && (
          <p
            role="alert"
            className="basis-full text-sm font-medium text-[#D4271D]"
          >
            {errorMessage}
          </p>
        )}
      </div>
    </div>
  );
}
