"use client";

import dynamic from "next/dynamic";
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

const RichTextEditor = dynamic(
  () =>
    import("@/components/kudos/kudos-content-editor-richtext").then(
      (m) => m.KudosContentEditorRichText,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex w-full flex-col gap-2">
        <div className="h-12 w-full animate-pulse rounded-t-lg border border-b-0 border-[#998C5F] bg-white" />
        <div className="-mt-2 h-44 w-full animate-pulse rounded-b-lg border border-t-0 border-[#998C5F] bg-white" />
      </div>
    ),
  },
);

/**
 * Public wrapper that lazy-loads the Tiptap-powered editor. Keeps the
 * heavy ProseMirror bundle off the initial composer chunk; users only
 * pay for it when the composer actually mounts.
 */
export function KudosContentEditor(props: Props) {
  return <RichTextEditor {...props} />;
}
