"use client";

type Props = {
  cancelLabel: string;
  submitLabel: string;
  submittingLabel: string;
  submitting: boolean;
  canSubmit: boolean;
  onCancel: () => void;
  onSubmit: () => void;
};

/**
 * `H_Frame 538` footer (Figma `I520:11647;520:9905`):
 *   - H.1 `Hủy` — outlined secondary, text + × icon, compact width
 *   - H.2 `Gửi` — primary yellow `#FFEA9E`, text + ▷ icon, fills the
 *     remaining width, disabled until all required fields are valid.
 */
export function KudosComposerFooter({
  cancelLabel,
  submitLabel,
  submittingLabel,
  submitting,
  canSubmit,
  onCancel,
  onSubmit,
}: Props) {
  return (
    <div className="flex w-full items-center gap-4 pt-2">
      <button
        type="button"
        onClick={onCancel}
        disabled={submitting}
        className="inline-flex h-14 items-center justify-center gap-2 rounded-lg border border-[#998C5F] bg-white px-8 text-base font-bold text-[#00101A] transition-colors hover:border-[#00101A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saa-cta-bg disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span>{cancelLabel}</span>
        <CloseGlyph />
      </button>
      <button
        type="button"
        onClick={onSubmit}
        disabled={!canSubmit}
        aria-disabled={!canSubmit}
        className="inline-flex h-14 flex-1 items-center justify-center gap-2 rounded-lg bg-[#FFEA9E] px-8 text-base font-bold text-[#00101A] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saa-cta-bg disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span>{submitting ? submittingLabel : submitLabel}</span>
        <SendGlyph />
      </button>
    </div>
  );
}

function CloseGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function SendGlyph() {
  // Inline copy of `MM_MEDIA_Send` (24×24) drawn with `currentColor` so
  // it inherits the dark `text-[#00101A]` colour of the yellow primary
  // button — matching the Figma `H.2_Button` icon styling.
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className="h-6 w-6"
    >
      <path
        d="M2.9043 20.4797V4.47974L21.9043 12.4797M4.9043 17.4797L16.7543 12.4797L4.9043 7.47974V10.9797L10.9043 12.4797L4.9043 13.9797M4.9043 17.4797V7.47974V13.9797V17.4797Z"
        fill="currentColor"
      />
    </svg>
  );
}
