"use client";

import type { ComposerErrorMap } from "@/hooks/use-kudos-composer";

type Props = {
  label: string;
  placeholder: string;
  helperText: string;
  value: string;
  error: ComposerErrorMap["headline"];
  copy: {
    requiredError: string;
  };
  onChange: (value: string) => void;
};

const MAX_LEN = 80;

/**
 * `Danh hiệu` field (Figma Frame 552 — `I520:11647;1688:10448`).
 *
 * The title the sender awards their teammate. Becomes the centred bold
 * heading on the cream Kudos card. Required; the helper text below the
 * input explains how it'll render on the published card.
 */
export function KudosHeadlineField({
  label,
  placeholder,
  helperText,
  value,
  error,
  copy,
  onChange,
}: Props) {
  const errorMessage = error === "REQUIRED" ? copy.requiredError : null;

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex w-full items-center gap-6">
        <label
          htmlFor="kudos-headline-input"
          className="w-32 shrink-0 text-base font-bold leading-6 text-[#00101A]"
        >
          {label}
          <span className="ml-1 text-[#D4271D]">*</span>
        </label>
        <input
          id="kudos-headline-input"
          type="text"
          value={value}
          placeholder={placeholder}
          maxLength={MAX_LEN}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={Boolean(errorMessage)}
          aria-describedby="kudos-headline-helper"
          className={`flex-1 rounded-lg border bg-white px-6 py-4 text-base font-medium text-[#00101A] placeholder:text-[#999999] focus:outline-none focus:ring-2 focus:ring-saa-cta-bg ${
            errorMessage ? "border-[#D4271D]" : "border-[#998C5F]"
          }`}
        />
      </div>
      <p
        id="kudos-headline-helper"
        className="ml-[152px] whitespace-pre-line text-base font-bold leading-6 text-[#999999]"
      >
        {helperText}
      </p>
      {errorMessage && (
        <p
          role="alert"
          className="ml-[152px] text-sm font-medium text-[#D4271D]"
        >
          {errorMessage}
        </p>
      )}
    </div>
  );
}
