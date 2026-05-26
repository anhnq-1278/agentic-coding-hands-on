import Link from "next/link";
import ReactMarkdown from "react-markdown";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { parseKudosMessage } from "@/lib/kudos/markdown";

type Props = {
  message: string;
  /** Tailwind classes applied to the wrapping <div>. */
  className?: string;
};

const SANITIZE_SCHEMA = {
  ...defaultSchema,
  tagNames: [
    "p",
    "strong",
    "em",
    "del",
    "code",
    "br",
    "ul",
    "ol",
    "li",
    "blockquote",
    "a",
  ],
  attributes: {
    ...defaultSchema.attributes,
    a: [["href"], ["target"], ["rel"]],
  },
};

/**
 * Renders a Kudos message (Markdown + `@mention` tokens) into a safe
 * React tree. Mentions become clickable `<Link>` to the Sunner profile;
 * other Markdown is rendered via `react-markdown` with a strict
 * sanitisation allowlist (no raw HTML, no scripts).
 */
export function KudosMessage({ message, className }: Props) {
  const segments = parseKudosMessage(message);
  return (
    <div
      className={className}
      style={{ fontFamily: "var(--font-montserrat), Montserrat, sans-serif" }}
    >
      {segments.map((seg, i) =>
        seg.kind === "mention" ? (
          <Link
            key={`mention-${i}`}
            href={`/sunner/${seg.id}`}
            className="font-bold text-saa-cta-bg transition-opacity hover:opacity-80"
          >
            @{seg.displayName}
          </Link>
        ) : (
          <ReactMarkdown
            key={`md-${i}`}
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[[rehypeSanitize, SANITIZE_SCHEMA]]}
            components={{
              p: ({ children }) => (
                <span className="block leading-relaxed">{children}</span>
              ),
              a: ({ href, children }) => (
                <a
                  href={href ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-saa-cta-bg"
                >
                  {children}
                </a>
              ),
              ul: ({ children }) => (
                <ul className="list-disc pl-6">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal pl-6">{children}</ol>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-2 border-saa-cta-bg pl-3 italic">
                  {children}
                </blockquote>
              ),
            }}
          >
            {seg.text}
          </ReactMarkdown>
        ),
      )}
    </div>
  );
}
