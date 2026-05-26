import { describe, expect, it } from "vitest";
import { tiptapJsonToMarkdown } from "@/lib/kudos/tiptap-serializer";

describe("tiptapJsonToMarkdown", () => {
  it("returns empty string for empty doc", () => {
    expect(tiptapJsonToMarkdown({ type: "doc", content: [] })).toBe("");
  });

  it("serialises plain paragraphs separated by blank lines", () => {
    const doc = {
      type: "doc",
      content: [
        { type: "paragraph", content: [{ type: "text", text: "Hello" }] },
        { type: "paragraph", content: [{ type: "text", text: "World" }] },
      ],
    };
    expect(tiptapJsonToMarkdown(doc)).toBe("Hello\n\nWorld");
  });

  it("wraps marks: bold, italic, strike", () => {
    const doc = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "bold",
              marks: [{ type: "bold" }],
            },
            { type: "text", text: " " },
            {
              type: "text",
              text: "ital",
              marks: [{ type: "italic" }],
            },
            { type: "text", text: " " },
            {
              type: "text",
              text: "gone",
              marks: [{ type: "strike" }],
            },
          ],
        },
      ],
    };
    expect(tiptapJsonToMarkdown(doc)).toBe("**bold** *ital* ~~gone~~");
  });

  it("emits link mark as Markdown link", () => {
    const doc = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "click",
              marks: [{ type: "link", attrs: { href: "https://x.test" } }],
            },
          ],
        },
      ],
    };
    expect(tiptapJsonToMarkdown(doc)).toBe("[click](https://x.test)");
  });

  it("serialises mention nodes in canonical @[name](id) form", () => {
    const doc = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "Cheers " },
            {
              type: "mention",
              attrs: { id: "sn-42", label: "Quốc Anh" },
            },
            { type: "text", text: "!" },
          ],
        },
      ],
    };
    expect(tiptapJsonToMarkdown(doc)).toBe("Cheers @[Quốc Anh](sn-42)!");
  });

  it("serialises blockquote line-by-line", () => {
    const doc = {
      type: "doc",
      content: [
        {
          type: "blockquote",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Awesome" }],
            },
          ],
        },
      ],
    };
    expect(tiptapJsonToMarkdown(doc)).toBe("> Awesome");
  });

  it("serialises an ordered list with sequential numbering", () => {
    const doc = {
      type: "doc",
      content: [
        {
          type: "orderedList",
          content: [
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "first" }],
                },
              ],
            },
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "second" }],
                },
              ],
            },
          ],
        },
      ],
    };
    expect(tiptapJsonToMarkdown(doc)).toBe("1. first\n2. second");
  });

  it("escapes Markdown control characters in text", () => {
    const doc = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "stars *not* bold" }],
        },
      ],
    };
    expect(tiptapJsonToMarkdown(doc)).toBe("stars \\*not\\* bold");
  });
});
