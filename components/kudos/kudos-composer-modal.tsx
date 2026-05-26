"use client";

import { FocusTrap } from "focus-trap-react";
import { useEffect } from "react";
import { KudosComposer, type ComposerCopy } from "@/components/kudos/kudos-composer";
import type { RecipientSelection } from "@/hooks/use-kudos-composer";

type Props = {
  isOpen: boolean;
  viewerId: string;
  initialRecipient?: RecipientSelection;
  copy: ComposerCopy;
  onClose: () => void;
};

/**
 * Modal shell that wraps `<KudosComposer mode="modal">` with:
 *   - Semi-transparent dim + blur over the underlying `/sun-kudos` page,
 *     so the cosmic banner already on that page stays visible behind the
 *     cream modal (matches the layering in Figma `ihQ26W78P2` where the
 *     Mask sits over the Keyvisual at 80% opacity).
 *   - `role="dialog"` + `aria-modal="true"` + `aria-labelledby`
 *   - Esc-to-close + click-outside-to-close
 *   - Focus trap via `focus-trap-react` (returns focus to trigger on close)
 *   - Body scroll lock while open.
 */
export function KudosComposerModal({
  isOpen,
  viewerId,
  initialRecipient,
  copy,
  onClose,
}: Props) {
  useEffect(() => {
    if (!isOpen) return;
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleEsc);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <FocusTrap
      focusTrapOptions={{
        initialFocus: false,
        clickOutsideDeactivates: false,
        escapeDeactivates: false, // we handle Esc ourselves
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="kudos-composer-title"
        className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#00101A]/80 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div
          className="relative z-10 w-full max-w-[752px] px-6 py-12"
          onClick={(e) => e.stopPropagation()}
        >
          <KudosComposer
            mode="modal"
            viewerId={viewerId}
            initialRecipient={initialRecipient}
            copy={copy}
            onClose={onClose}
          />
        </div>
      </div>
    </FocusTrap>
  );
}
