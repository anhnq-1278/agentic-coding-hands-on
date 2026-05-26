type Props = {
  timeLabel: string;
  timeValue: string;
  locationLabel: string;
  locationValue: string;
  livestreamNote: string;
};

/**
 * mms_B2_Thông tin sự kiện — three-line static event info block.
 * - Two grouped label/value pairs (time + location), values rendered yellow.
 * - Bottom note (livestream).
 */
export function EventInfo({
  timeLabel,
  timeValue,
  locationLabel,
  locationValue,
  livestreamNote,
}: Props) {
  const fontFamily =
    "var(--font-montserrat), Montserrat, sans-serif" as const;

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex items-center gap-[60px]">
        <span className="flex items-baseline gap-2">
          <span
            className="text-base font-bold leading-6 tracking-[0.15px] text-saa-text-primary"
            style={{ fontFamily }}
          >
            {timeLabel}
          </span>
          <span
            className="text-2xl font-bold leading-8 text-saa-cta-bg"
            style={{ fontFamily }}
          >
            {timeValue}
          </span>
        </span>
        <span className="flex items-baseline gap-2">
          <span
            className="text-base font-bold leading-6 tracking-[0.15px] text-saa-text-primary"
            style={{ fontFamily }}
          >
            {locationLabel}
          </span>
          <span
            className="text-2xl font-bold leading-8 text-saa-cta-bg"
            style={{ fontFamily }}
          >
            {locationValue}
          </span>
        </span>
      </div>
      <p
        className="text-base font-bold leading-6 tracking-[0.5px] text-saa-text-primary"
        style={{ fontFamily }}
      >
        {livestreamNote}
      </p>
    </div>
  );
}
