import type { ReactNode } from "react";

/**
 * Mention token canonical form: `@[displayName](sunner-id)`.
 *
 * The Tiptap editor serialises mentions into this form. The renderer
 * (`<KudosMessage>`) parses it back into `<Link href="/sunner/{id}">`
 * before passing the message through Markdown.
 */
const MENTION_RE = /@\[([^\]]+)\]\(([a-zA-Z0-9_-]+)\)/g;

export type ParsedSegment =
  | { kind: "markdown"; text: string }
  | { kind: "mention"; id: string; displayName: string };

/**
 * Split a Kudos message into Markdown chunks and mention tokens.
 * Mention tokens are extracted before Markdown parsing so that a
 * Markdown link doesn't accidentally swallow them.
 */
export function parseKudosMessage(message: string): ParsedSegment[] {
  const segments: ParsedSegment[] = [];
  let lastIndex = 0;
  for (const match of message.matchAll(MENTION_RE)) {
    const start = match.index ?? 0;
    if (start > lastIndex) {
      segments.push({ kind: "markdown", text: message.slice(lastIndex, start) });
    }
    segments.push({
      kind: "mention",
      displayName: match[1],
      id: match[2],
    });
    lastIndex = start + match[0].length;
  }
  if (lastIndex < message.length) {
    segments.push({ kind: "markdown", text: message.slice(lastIndex) });
  }
  return segments;
}

/**
 * Sanitisation policy — allow only the Markdown formatting the editor
 * can produce. Tags outside this list are stripped at render time by
 * `rehype-sanitize`.
 */
export const MARKDOWN_ALLOWED_TAGS: ReadonlySet<string> = new Set([
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
]);

/**
 * Re-exported for tests / consumers. The actual React rendering lives
 * in `components/kudos/kudos-message.tsx` so this file stays free of
 * JSX (and thus tree-shakable from server-only code that just needs
 * the parser).
 */
export type { ReactNode };
