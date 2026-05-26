"use client";

import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Link } from "@tiptap/extension-link";
import { useEffect } from "react";
import { tiptapJsonToMarkdown } from "@/lib/kudos/tiptap-serializer";
import type { ComposerErrorMap } from "@/hooks/use-kudos-composer";

type Props = {
  placeholder: string;
  value: string;
  error: ComposerErrorMap["message"];
  copy: {
    requiredError: string;
    mentionHint: string;
    communityStandardsLabel: string;
    formatBoldLabel: string;
    formatItalicLabel: string;
    formatStrikeLabel: string;
    formatNumberListLabel: string;
    formatLinkLabel: string;
    formatLinkPrompt: string;
    formatQuoteLabel: string;
  };
  onChange: (markdown: string) => void;
};

/**
 * Tiptap rich-text editor for the `Nhập kudo` field (US5). White-themed
 * to match the cream modal: toolbar row with format buttons on the left
 * and the red `Tiêu chuẩn cộng đồng` link on the right, then a white
 * textarea-style editor below.
 */
export function KudosContentEditorRichText({
  placeholder,
  value,
  error,
  copy,
  onChange,
}: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        code: false,
        horizontalRule: false,
        bulletList: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "underline text-[#D4271D]" },
      }),
    ],
    content: "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "min-h-44 w-full px-6 py-4 text-base font-medium text-[#00101A] focus:outline-none prose prose-sm max-w-none",
      },
    },
    onUpdate: ({ editor: e }) => {
      const json = e.getJSON();
      onChange(tiptapJsonToMarkdown(json as never));
    },
  });

  // External resets clear `value` to ""; mirror that into the editor.
  useEffect(() => {
    if (!editor) return;
    if (value === "" && !editor.isEmpty) {
      editor.commands.clearContent(false);
    }
  }, [editor, value]);

  const errorMessage = error === "REQUIRED" ? copy.requiredError : null;
  const isEmpty = editor?.isEmpty ?? true;

  return (
    <div className="flex w-full flex-col gap-2">
      <div
        className={`flex w-full flex-col overflow-hidden rounded-lg border bg-white ${
          errorMessage ? "border-[#D4271D]" : "border-[#998C5F]"
        }`}
      >
        {editor && (
          <RichTextToolbar
            editor={editor}
            copy={copy}
            communityStandardsLabel={copy.communityStandardsLabel}
          />
        )}
        <div className="relative">
          {isEmpty && (
            <span className="pointer-events-none absolute left-6 top-4 text-base font-medium text-[#999999]">
              {placeholder}
            </span>
          )}
          <EditorContent
            editor={editor}
            id="kudos-content-input"
            aria-invalid={Boolean(errorMessage)}
            aria-describedby={
              errorMessage ? "kudos-content-error" : "kudos-content-hint"
            }
          />
        </div>
      </div>
      <p
        id="kudos-content-hint"
        className="text-center text-base font-bold text-[#00101A]"
      >
        {copy.mentionHint}
      </p>
      {errorMessage && (
        <p
          id="kudos-content-error"
          role="alert"
          className="text-sm font-medium text-[#D4271D]"
        >
          {errorMessage}
        </p>
      )}
    </div>
  );
}

type ToolbarProps = {
  editor: Editor;
  copy: Pick<
    Props["copy"],
    | "formatBoldLabel"
    | "formatItalicLabel"
    | "formatStrikeLabel"
    | "formatNumberListLabel"
    | "formatLinkLabel"
    | "formatLinkPrompt"
    | "formatQuoteLabel"
  >;
  communityStandardsLabel: string;
};

function RichTextToolbar({
  editor,
  copy,
  communityStandardsLabel,
}: ToolbarProps) {
  function setLink() {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt(copy.formatLinkPrompt, previous ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  return (
    <div
      className="flex w-full items-center justify-between gap-2 border-b border-[#998C5F]/40 px-4 py-2"
      role="toolbar"
      aria-label="Format"
    >
      <div className="flex items-center gap-1">
        <ToolbarButton
          label={copy.formatBoldLabel}
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <span className="font-bold">B</span>
        </ToolbarButton>
        <ToolbarButton
          label={copy.formatItalicLabel}
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <span className="italic">I</span>
        </ToolbarButton>
        <ToolbarButton
          label={copy.formatStrikeLabel}
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <span className="line-through">S</span>
        </ToolbarButton>
        <ToolbarButton
          label={copy.formatNumberListLabel}
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <NumberListGlyph />
        </ToolbarButton>
        <ToolbarButton
          label={copy.formatLinkLabel}
          active={editor.isActive("link")}
          onClick={setLink}
        >
          <LinkGlyph />
        </ToolbarButton>
        <ToolbarButton
          label={copy.formatQuoteLabel}
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <QuoteGlyph />
        </ToolbarButton>
      </div>
      <a
        href="/community-standards"
        target="_blank"
        rel="noreferrer"
        className="text-base font-bold text-[#D4271D] underline-offset-4 hover:underline"
      >
        {communityStandardsLabel}
      </a>
    </div>
  );
}

function ToolbarButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={`flex h-9 w-9 items-center justify-center rounded-md text-base text-[#00101A] transition-colors ${
        active
          ? "bg-[#00101A]/10"
          : "hover:bg-[#00101A]/5"
      }`}
    >
      {children}
    </button>
  );
}

function NumberListGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <line x1="10" y1="6" x2="21" y2="6" />
      <line x1="10" y1="12" x2="21" y2="12" />
      <line x1="10" y1="18" x2="21" y2="18" />
      <path d="M4 6h1v4" />
      <path d="M4 10h2" />
      <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
    </svg>
  );
}

function LinkGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" />
      <path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
    </svg>
  );
}

function QuoteGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="currentColor"
      aria-hidden
    >
      <path d="M7.17 7c-2.41 0-4 1.5-4 4 0 2 1.5 4 4 4 .67 0 1.33-.17 1.83-.5-.17 1.83-1.67 3-3.83 3v2c3.5 0 6-2.33 6-6.5 0-3.83-2-6-4-6Zm10 0c-2.41 0-4 1.5-4 4 0 2 1.5 4 4 4 .67 0 1.33-.17 1.83-.5-.17 1.83-1.67 3-3.83 3v2c3.5 0 6-2.33 6-6.5 0-3.83-2-6-4-6Z" />
    </svg>
  );
}
