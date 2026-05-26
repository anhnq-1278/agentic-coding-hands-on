"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";
import { useToast } from "@/components/feedback/toast-host";
import type { SidebarStats } from "@/lib/kudos/types";

type Props = {
  copy: {
    receivedLabel: string;
    sentLabel: string;
    heartsLabel: string;
    boxesOpenedLabel: string;
    boxesPendingLabel: string;
    recentGiftsTitle: string;
    emptyLeaderboardMessage: string;
    loadingLabel: string;
    secretBoxButtonLabel: string;
    secretBoxDisabledTooltip: string;
  };
};

async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as T;
}

export function KudosSidebar({ copy }: Props) {
  const stats = useSWR<SidebarStats>("/api/users/me", fetcher);
  const { showToast } = useToast();
  const [opening, setOpening] = useState(false);

  async function handleOpenSecretBox() {
    if (opening) return;
    setOpening(true);
    try {
      const res = await fetch("/api/kudos/secret-boxes/open", {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        const json = (await res.json()) as {
          box: { rewardLabel: string };
        };
        showToast(`🎁 ${json.box.rewardLabel}`, "success");
        await stats.mutate();
      } else {
        const json = await res.json().catch(() => ({ error: "Error" }));
        showToast(json.error ?? "Error", "error");
      }
    } catch {
      showToast("Network error", "error");
    } finally {
      setOpening(false);
    }
  }

  if (stats.isLoading || !stats.data) {
    return (
      <aside className="rounded-2xl border border-saa-divider bg-saa-bg/40 p-6 text-sm text-saa-text-muted">
        {copy.loadingLabel}
      </aside>
    );
  }

  const { user, recentGifts } = stats.data;
  const hasPending = user.secretBoxesPending > 0;

  return (
    <aside
      className="flex flex-col gap-6"
      style={{
        fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
      }}
    >
      {/* D.1_Thống kê tổng quát — own bordered box (Figma 2940:13489).
          border `#998C5F`, bg `#00070C`, padding 24, radius 17. */}
      <section className="flex flex-col gap-6 rounded-[17px] border border-[#998C5F] bg-[#00070C] p-6">
        <header className="flex items-center gap-3">
          <div className="relative h-14 w-14 overflow-hidden rounded-full ring-2 ring-saa-cta-bg/60">
            <Image
              src={user.avatarUrl}
              alt={user.displayName}
              fill
              sizes="56px"
              className="object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-bold text-saa-text-primary">
              {user.displayName}
            </p>
            <p className="truncate text-xs text-saa-text-muted">
              {user.title} · {user.departmentName}
            </p>
          </div>
        </header>

        <dl className="grid grid-cols-1 gap-3 text-sm">
          <SidebarRow label={copy.receivedLabel} value={user.kudosReceived} />
          <SidebarRow label={copy.sentLabel} value={user.kudosSent} />
          <SidebarRow label={copy.heartsLabel} value={user.heartsReceived} />
          <SidebarRow
            label={copy.boxesOpenedLabel}
            value={user.secretBoxesOpened}
          />
          <SidebarRow
            label={copy.boxesPendingLabel}
            value={user.secretBoxesPending}
          />
        </dl>

        {/* D.1.8_Button mở quà (Figma 2940:13497):
            - 374×60, padding 16, radius 8, bg `#FFEA9E`
            - Centered row: 22px Montserrat 700 dark text + 24×24 dark icon
              AFTER the text (gap 8). */}
        <button
          type="button"
          onClick={() => void handleOpenSecretBox()}
          disabled={!hasPending || opening}
          title={!hasPending ? copy.secretBoxDisabledTooltip : undefined}
          className={`inline-flex h-15 items-center justify-center gap-2 rounded-lg px-4 text-[22px] font-bold leading-7 transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saa-cta-bg ${
            hasPending
              ? "bg-saa-cta-bg text-[#00101A] hover:opacity-90"
              : "cursor-not-allowed border border-saa-divider text-saa-text-muted opacity-60"
          }`}
          style={{
            fontFamily:
              "var(--font-montserrat), Montserrat, sans-serif",
          }}
        >
          <span>{copy.secretBoxButtonLabel}</span>
          <OpenGiftIcon />
        </button>
      </section>

      {/* D.3_10 SUNNER nhận quà — separate bordered box (Figma 2940:13510). */}
      <section className="flex flex-col gap-4 rounded-[17px] border border-[#998C5F] bg-[#00070C] p-6">
        {/* D.3.1 title — 22px Montserrat 700 yellow centered (Figma 2940:13513). */}
        <h3 className="whitespace-pre-line text-center text-[22px] font-bold leading-7 text-saa-cta-bg">
          {copy.recentGiftsTitle}
        </h3>
        {recentGifts.length === 0 ? (
          <p className="text-sm text-saa-text-muted">
            {copy.emptyLeaderboardMessage}
          </p>
        ) : (
          /* 5 rows visible (each 64px tall + gap 16) = 384px viewport;
             remaining rows scroll under a custom 2px gray thumb that
             mirrors Figma `Frame 545` (2940:13521). */
          <ul className="saa-thin-scroll flex max-h-[384px] flex-col gap-4 overflow-y-auto pr-3">
            {recentGifts.map((gift) => (
              <li key={gift.id} className="flex items-center gap-3">
                <Link
                  href={`/sunner/${gift.sunner.id}`}
                  className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full ring-1 ring-saa-divider transition-shadow hover:ring-2 hover:ring-saa-cta-bg"
                >
                  <Image
                    src={gift.sunner.avatarUrl}
                    alt={gift.sunner.displayName}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/sunner/${gift.sunner.id}`}
                    className="block truncate text-sm font-bold text-saa-text-primary transition-colors hover:text-saa-cta-bg"
                  >
                    {gift.sunner.displayName}
                  </Link>
                  <p className="truncate text-xs text-saa-text-muted">
                    {gift.giftDescription}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </aside>
  );
}

function SidebarRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-saa-text-muted">{label}</dt>
      <dd className="text-base font-bold tabular-nums text-saa-text-primary">
        {value}
      </dd>
    </div>
  );
}

/** Open-gift icon (D.1.8 MM_MEDIA_Open Gift) — inline SVG drawn in
 *  `currentColor` so it inherits the button's dark text colour. */
function OpenGiftIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="h-6 w-6"
    >
      <polyline points="20 12 20 22 4 22 4 12" />
      <rect x="2" y="7" width="20" height="5" />
      <line x1="12" y1="22" x2="12" y2="7" />
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7Z" />
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7Z" />
    </svg>
  );
}
