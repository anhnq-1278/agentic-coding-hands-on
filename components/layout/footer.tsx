type Props = {
  copyright: string;
};

/**
 * mms_D_Footer — non-interactive copyright bar.
 * Border-top references Figma token `var(--Details-Divider, #2E3940)`.
 */
export function Footer({ copyright }: Props) {
  return (
    <footer className="flex w-full items-center justify-center border-t border-saa-divider px-[90px] py-10 text-saa-text-primary">
      <p
        className="text-center text-base font-bold leading-6"
        style={{
          fontFamily:
            "var(--font-montserrat-alternates), 'Montserrat Alternates', Montserrat, sans-serif",
        }}
      >
        {copyright}
      </p>
    </footer>
  );
}
