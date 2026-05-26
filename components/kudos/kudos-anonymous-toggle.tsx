"use client";

type Props = {
  label: string;
  aliasPlaceholder: string;
  isAnonymous: boolean;
  alias: string;
  onToggle: () => void;
  onAliasChange: (alias: string) => void;
};

/**
 * `G_Gửi ẩn danh` block (Figma `I520:11647;520:14099`):
 *   - Checkbox "Gửi lời cám ơn và ghi nhận ẩn danh"
 *   - When checked, reveals an alias text field (`maxLength=60`).
 *   - Dark text on cream background.
 */
export function KudosAnonymousToggle({
  label,
  aliasPlaceholder,
  isAnonymous,
  alias,
  onToggle,
  onAliasChange,
}: Props) {
  return (
    <div className="flex w-full flex-col gap-3">
      <label className="inline-flex items-center gap-3">
        <input
          type="checkbox"
          checked={isAnonymous}
          onChange={onToggle}
          className="h-5 w-5 cursor-pointer rounded-md border-2 border-[#998C5F] bg-white accent-saa-cta-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saa-cta-bg"
        />
        <span className="text-base font-bold text-[#00101A]">{label}</span>
      </label>
      {isAnonymous && (
        <input
          type="text"
          value={alias}
          maxLength={60}
          placeholder={aliasPlaceholder}
          onChange={(e) => onAliasChange(e.target.value)}
          className="ml-8 h-12 w-full max-w-md rounded-lg border border-[#998C5F] bg-white px-4 text-sm text-[#00101A] placeholder:text-[#999999] focus:border-saa-cta-bg focus:outline-none"
        />
      )}
    </div>
  );
}
