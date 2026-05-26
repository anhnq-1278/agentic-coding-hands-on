// Tiptap (ProseMirror) JSON → Markdown serializer scoped to the
// formatting subset the Viết Kudo composer supports:
//   - paragraph, hard_break, ordered_list, list_item, blockquote
//   - bold, italic, strike marks
//   - link mark
//   - mention node (custom) — serialised as `@[displayName](id)`
//
// We don't aim for fidelity outside that subset. Anything unrecognised
// is rendered as plain text so the final Markdown never crashes the
// downstream renderer.

type Node = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: Node[];
  text?: string;
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
};

function escapeMarkdown(text: string): string {
  // Escape only the chars that would terminate a span inadvertently.
  // Keep punctuation readable: don't escape `(`, `)`, `.`, etc.
  return text.replace(/([\\`*_~\[\]])/g, "\\$1");
}

function applyMarks(text: string, marks: Node["marks"]): string {
  if (!marks || marks.length === 0) return text;
  let result = text;
  let prefix = "";
  let suffix = "";
  for (const mark of marks) {
    switch (mark.type) {
      case "bold":
        prefix = `**${prefix}`;
        suffix = `${suffix}**`;
        break;
      case "italic":
        prefix = `*${prefix}`;
        suffix = `${suffix}*`;
        break;
      case "strike":
        prefix = `~~${prefix}`;
        suffix = `${suffix}~~`;
        break;
      case "link": {
        const href = (mark.attrs?.href as string | undefined) ?? "";
        result = `[${result}](${href})`;
        break;
      }
    }
  }
  return `${prefix}${result}${suffix}`;
}

function renderInline(nodes: Node[] | undefined): string {
  if (!nodes) return "";
  return nodes
    .map((n) => {
      if (n.type === "text") {
        return applyMarks(escapeMarkdown(n.text ?? ""), n.marks);
      }
      if (n.type === "hardBreak") {
        return "  \n";
      }
      if (n.type === "mention") {
        const id = (n.attrs?.id as string | undefined) ?? "";
        const label =
          (n.attrs?.label as string | undefined) ??
          (n.attrs?.displayName as string | undefined) ??
          id;
        return `@[${label}](${id})`;
      }
      // Unknown inline — fall through with empty text.
      return "";
    })
    .join("");
}

function renderBlock(node: Node, listDepth = 0): string {
  switch (node.type) {
    case "paragraph": {
      return renderInline(node.content);
    }
    case "blockquote": {
      const inner = (node.content ?? [])
        .map((c) => renderBlock(c, listDepth))
        .join("\n\n");
      return inner
        .split("\n")
        .map((line) => `> ${line}`)
        .join("\n");
    }
    case "orderedList": {
      const items = (node.content ?? [])
        .map((item, i) => {
          const body = (item.content ?? [])
            .map((c) => renderBlock(c, listDepth + 1))
            .join("\n\n");
          const indent = "   ".repeat(listDepth);
          const [first, ...rest] = body.split("\n");
          const restIndented = rest
            .map((r) => `${indent}   ${r}`)
            .join("\n");
          return `${indent}${i + 1}. ${first}${rest.length > 0 ? `\n${restIndented}` : ""}`;
        })
        .join("\n");
      return items;
    }
    case "bulletList": {
      const items = (node.content ?? [])
        .map((item) => {
          const body = (item.content ?? [])
            .map((c) => renderBlock(c, listDepth + 1))
            .join("\n\n");
          const indent = "   ".repeat(listDepth);
          return `${indent}- ${body}`;
        })
        .join("\n");
      return items;
    }
    case "listItem": {
      return (node.content ?? [])
        .map((c) => renderBlock(c, listDepth))
        .join("\n");
    }
    default:
      return renderInline(node.content);
  }
}

export function tiptapJsonToMarkdown(doc: Node): string {
  if (!doc || doc.type !== "doc" || !doc.content) return "";
  return doc.content
    .map((b) => renderBlock(b, 0))
    .filter((s) => s !== "")
    .join("\n\n")
    .trim();
}
