type Props = {
  title: string;
  id?: string;
};

/**
 * `A_Title` (Figma `I520:11647;520:9870`) — dark, centred heading at the
 * top of the cream modal card.
 */
export function KudosComposerTitle({
  title,
  id = "kudos-composer-title",
}: Props) {
  return (
    <h2
      id={id}
      className="w-full text-center text-3xl font-bold leading-tight tracking-tight text-[#00101A]"
    >
      {title}
    </h2>
  );
}
