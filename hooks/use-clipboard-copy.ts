"use client";

import { useCallback } from "react";
import { useToast } from "@/components/feedback/toast-host";

type UseClipboardCopyOptions = {
  successMessage: string;
  errorMessage?: string;
};

/**
 * Copy text to the user's clipboard with toast feedback. Prefers the modern
 * Async Clipboard API; falls back to `document.execCommand("copy")` for
 * legacy browsers and jsdom.
 */
export function useClipboardCopy({
  successMessage,
  errorMessage,
}: UseClipboardCopyOptions) {
  const { showToast } = useToast();

  return useCallback(
    async (text: string) => {
      let ok = false;
      try {
        if (
          typeof navigator !== "undefined" &&
          navigator.clipboard?.writeText
        ) {
          await navigator.clipboard.writeText(text);
          ok = true;
        } else if (typeof document !== "undefined") {
          const ta = document.createElement("textarea");
          ta.value = text;
          ta.style.position = "fixed";
          ta.style.opacity = "0";
          document.body.appendChild(ta);
          ta.select();
          ok = document.execCommand("copy");
          document.body.removeChild(ta);
        }
      } catch {
        ok = false;
      }

      if (ok) {
        showToast(successMessage, "success");
      } else if (errorMessage) {
        showToast(errorMessage, "error");
      }
      return ok;
    },
    [errorMessage, showToast, successMessage],
  );
}
