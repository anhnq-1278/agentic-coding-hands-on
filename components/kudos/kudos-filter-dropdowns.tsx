"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import type { Department, Hashtag, KudosFilters } from "@/lib/kudos/types";

type Props = {
  filters: KudosFilters;
  copy: {
    hashtagLabel: string;
    departmentLabel: string;
    clearLabel: string;
  };
  onSelectHashtag: (tag: string | null) => void;
  onSelectDepartment: (id: string | null) => void;
};

async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as T;
}

/**
 * `B.1_Filters` row — two dropdown buttons that scope Highlight + All
 * Kudos + Spotlight by Hashtag and Phòng ban. Only one filter active at
 * a time (mutually-exclusive selection — selecting one clears the other).
 */
export function KudosFilterDropdowns({
  filters,
  copy,
  onSelectHashtag,
  onSelectDepartment,
}: Props) {
  const hashtags = useSWR<{ items: readonly Hashtag[] }>(
    "/api/kudos/hashtags",
    fetcher,
  );
  const departments = useSWR<{ items: readonly Department[] }>(
    "/api/kudos/departments",
    fetcher,
  );

  return (
    <div className="flex flex-wrap items-center gap-3">
      <DropdownButton
        label={copy.hashtagLabel}
        clearLabel={copy.clearLabel}
        selected={filters.hashtag}
        items={
          hashtags.data?.items.map((h) => ({
            id: h.tag,
            label: `#${h.tag}`,
            count: h.kudosCount,
          })) ?? []
        }
        onSelect={onSelectHashtag}
      />
      <DropdownButton
        label={copy.departmentLabel}
        clearLabel={copy.clearLabel}
        selected={filters.departmentId}
        items={
          departments.data?.items.map((d) => ({
            id: d.id,
            label: d.name,
            count: d.kudosCount,
          })) ?? []
        }
        onSelect={onSelectDepartment}
      />
    </div>
  );
}

function DropdownButton({
  label,
  clearLabel,
  selected,
  items,
  onSelect,
}: {
  label: string;
  clearLabel: string;
  selected: string | null;
  items: ReadonlyArray<{ id: string; label: string; count: number }>;
  onSelect: (id: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

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

  const selectedItem = items.find((i) => i.id === selected);
  const buttonLabel = selectedItem ? selectedItem.label : label;
  const isActive = selected !== null;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={`inline-flex items-center gap-2 rounded border px-4 py-3 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saa-cta-bg ${
          isActive
            ? "border-saa-cta-bg bg-saa-cta-bg/20 text-saa-cta-bg"
            : "border-[#998C5F] bg-saa-cta-bg/10 text-saa-text-primary hover:border-saa-cta-bg/80"
        }`}
        style={{
          fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
        }}
      >
        {buttonLabel}
        <Image
          src="/assets/sun-kudos/icons/chevron-down.svg"
          alt=""
          width={20}
          height={20}
          className={`h-5 w-5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute left-0 top-full z-30 mt-2 max-h-80 w-64 overflow-auto rounded-lg border border-saa-divider bg-saa-bg/95 p-1 shadow-xl backdrop-blur"
        >
          {selected !== null && (
            <li>
              <button
                type="button"
                onClick={() => {
                  onSelect(null);
                  setOpen(false);
                }}
                className="block w-full rounded-md px-3 py-2 text-left text-sm text-saa-text-muted hover:bg-saa-divider/50"
              >
                {clearLabel}
              </button>
            </li>
          )}
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                role="option"
                onClick={() => {
                  onSelect(item.id);
                  setOpen(false);
                }}
                aria-selected={item.id === selected}
                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors ${
                  item.id === selected
                    ? "bg-saa-cta-bg/20 text-saa-cta-bg"
                    : "text-saa-text-primary hover:bg-saa-divider/50"
                }`}
              >
                <span className="truncate">{item.label}</span>
                <span className="ml-3 shrink-0 text-xs text-saa-text-muted">
                  {item.count}
                </span>
              </button>
            </li>
          ))}
          {items.length === 0 && (
            <li className="px-3 py-2 text-sm text-saa-text-muted">—</li>
          )}
        </ul>
      )}
    </div>
  );
}
