"use client";

import { useCallback, useRef, useState } from "react";
import { useSWRConfig } from "swr";
import { useToast } from "@/components/feedback/toast-host";
import { KUDOS_ENDPOINTS } from "@/lib/kudos/cache-keys";
import type { Kudos } from "@/lib/kudos/types";

type Args = {
  initial: Pick<Kudos, "id" | "heartsCount" | "isHeartedByCurrentUser">;
  /** Author of the kudos; used to gate self-hearting client-side. */
  isSelfAuthored: boolean;
  errorMessage: string;
};

type State = {
  isHearted: boolean;
  heartsCount: number;
  isPending: boolean;
};

/**
 * Optimistic heart toggle hook. Flips local state first, then POSTs the
 * desired next-state to `/api/kudos/:id/heart`. On failure, reverts.
 *
 * Self-hearting is blocked client-side; the server also rejects with 403
 * so the client check is defence-in-depth.
 */
export function useKudosHeart({ initial, isSelfAuthored, errorMessage }: Args) {
  const { mutate } = useSWRConfig();
  const { showToast } = useToast();
  const [state, setState] = useState<State>({
    isHearted: initial.isHeartedByCurrentUser,
    heartsCount: initial.heartsCount,
    isPending: false,
  });
  const lastClickRef = useRef<number>(0);

  const toggle = useCallback(async () => {
    if (isSelfAuthored) return;
    const now = Date.now();
    if (now - lastClickRef.current < 200) return; // debounce rapid clicks
    lastClickRef.current = now;

    const previous = state;
    const next: State = {
      isHearted: !previous.isHearted,
      heartsCount: previous.isHearted
        ? Math.max(0, previous.heartsCount - 1)
        : previous.heartsCount + 1,
      isPending: true,
    };
    setState(next);

    try {
      const res = await fetch(`/api/kudos/${initial.id}/heart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ next: next.isHearted }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as {
        isHeartedByCurrentUser: boolean;
        heartsCount: number;
      };
      setState({
        isHearted: json.isHeartedByCurrentUser,
        heartsCount: json.heartsCount,
        isPending: false,
      });
      // Invalidate filtered feed + highlight caches and sidebar
      await Promise.all([
        mutate(
          (key) =>
            Array.isArray(key) &&
            typeof key[0] === "string" &&
            (key[0].startsWith(KUDOS_ENDPOINTS.feed) ||
              key[0].startsWith(KUDOS_ENDPOINTS.highlight)),
          undefined,
          { revalidate: true },
        ),
        mutate(KUDOS_ENDPOINTS.usersMe),
      ]);
    } catch {
      setState({ ...previous, isPending: false });
      showToast(errorMessage, "error");
    }
  }, [errorMessage, initial.id, isSelfAuthored, mutate, showToast, state]);

  return { ...state, toggle };
}
