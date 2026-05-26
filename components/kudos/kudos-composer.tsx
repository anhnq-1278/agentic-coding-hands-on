"use client";

import { useRouter } from "next/navigation";
import { KudosAnonymousToggle } from "@/components/kudos/kudos-anonymous-toggle";
import { KudosComposerFooter } from "@/components/kudos/kudos-composer-footer";
import { KudosComposerTitle } from "@/components/kudos/kudos-composer-title";
import { KudosContentEditor } from "@/components/kudos/kudos-content-editor";
import { KudosHashtagPicker } from "@/components/kudos/kudos-hashtag-picker";
import { KudosHeadlineField } from "@/components/kudos/kudos-headline-field";
import { KudosImageUploader } from "@/components/kudos/kudos-image-uploader";
import { KudosRecipientPicker } from "@/components/kudos/kudos-recipient-picker";
import {
  type RecipientSelection,
  useKudosComposer,
} from "@/hooks/use-kudos-composer";

export type ComposerCopy = {
  dialogTitle: string;
  recipientLabel: string;
  recipientPlaceholder: string;
  recipientRequired: string;
  recipientFreeFormError: string;
  recipientSelfError: string;
  headlineLabel: string;
  headlinePlaceholder: string;
  headlineHelper: string;
  headlineRequired: string;
  contentLabel: string;
  contentPlaceholder: string;
  contentRequired: string;
  contentMentionHint: string;
  communityStandardsLabel: string;
  hashtagLabel: string;
  hashtagButtonLabel: string;
  hashtagPlaceholder: string;
  hashtagCreateOption: string;
  hashtagRequired: string;
  hashtagDuplicateError: string;
  hashtagMaxError: string;
  imageButtonLabel: string;
  imageInvalidTypeError: string;
  imageSizeError: string;
  imageMaxError: string;
  anonymousLabel: string;
  anonymousAliasPlaceholder: string;
  anonymousDefaultName: string;
  helperText: string;
  cancelLabel: string;
  submitLabel: string;
  submittingLabel: string;
  submitSuccessToast: string;
  submitErrorMessage: string;
  networkErrorMessage: string;
  formatBoldLabel: string;
  formatItalicLabel: string;
  formatStrikeLabel: string;
  formatNumberListLabel: string;
  formatLinkLabel: string;
  formatLinkPrompt: string;
  formatQuoteLabel: string;
  mentionPlaceholder: string;
  noResultsLabel: string;
};

type Props = {
  mode: "modal" | "standalone";
  viewerId: string;
  initialRecipient?: RecipientSelection;
  copy: ComposerCopy;
  /** Modal mode only — called on Hủy / submit success. */
  onClose?: () => void;
};

/**
 * `Viết KUDO` composer card. Cream `#FFF8E1` background, 24px radius,
 * 40px padding per Figma `520:11647`. Used as the body of the modal
 * (above the dark backdrop on `/sun-kudos`) and as the standalone
 * `/viet-kudo` page.
 */
export function KudosComposer({
  mode,
  viewerId,
  initialRecipient,
  copy,
  onClose,
}: Props) {
  const router = useRouter();
  const { state, dispatch, submit, isValid } = useKudosComposer({
    initialRecipient,
  });

  function handleCancel(): void {
    dispatch({ type: "reset" });
    if (mode === "modal") {
      onClose?.();
    } else {
      router.push("/sun-kudos");
    }
  }

  function handleSubmit(): void {
    void submit(
      {
        onSuccess: () => {
          if (mode === "modal") {
            onClose?.();
          } else {
            router.push("/sun-kudos");
          }
        },
      },
      {
        submitErrorMessage: copy.submitErrorMessage,
        networkErrorMessage: copy.networkErrorMessage,
        submitSuccessToast: copy.submitSuccessToast,
      },
    );
  }

  return (
    <div
      className="flex w-full max-w-[752px] flex-col gap-8 rounded-3xl bg-[#FFF8E1] p-10 text-[#00101A] shadow-[0_24px_64px_rgba(0,0,0,0.45)]"
      style={{
        fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
      }}
    >
      <KudosComposerTitle title={copy.dialogTitle} />

      <KudosRecipientPicker
        label={copy.recipientLabel}
        placeholder={copy.recipientPlaceholder}
        query={state.recipientQuery}
        recipient={state.recipient}
        viewerId={viewerId}
        error={state.errors.recipient}
        copy={{
          requiredError: copy.recipientRequired,
          freeFormError: copy.recipientFreeFormError,
          selfError: copy.recipientSelfError,
          noResults: copy.noResultsLabel,
        }}
        onQueryChange={(q) =>
          dispatch({ type: "set-recipient-query", query: q })
        }
        onSelect={(r) => dispatch({ type: "set-recipient", recipient: r })}
      />

      <KudosHeadlineField
        label={copy.headlineLabel}
        placeholder={copy.headlinePlaceholder}
        helperText={copy.headlineHelper}
        value={state.headline}
        error={state.errors.headline}
        copy={{ requiredError: copy.headlineRequired }}
        onChange={(v) => dispatch({ type: "set-headline", headline: v })}
      />

      <KudosContentEditor
        placeholder={copy.contentPlaceholder}
        value={state.contentMarkdown}
        error={state.errors.message}
        copy={{
          requiredError: copy.contentRequired,
          mentionHint: copy.contentMentionHint,
          communityStandardsLabel: copy.communityStandardsLabel,
          formatBoldLabel: copy.formatBoldLabel,
          formatItalicLabel: copy.formatItalicLabel,
          formatStrikeLabel: copy.formatStrikeLabel,
          formatNumberListLabel: copy.formatNumberListLabel,
          formatLinkLabel: copy.formatLinkLabel,
          formatLinkPrompt: copy.formatLinkPrompt,
          formatQuoteLabel: copy.formatQuoteLabel,
        }}
        onChange={(md) => dispatch({ type: "set-content", markdown: md })}
      />

      <KudosHashtagPicker
        label={copy.hashtagLabel}
        buttonLabel={copy.hashtagButtonLabel}
        searchPlaceholder={copy.hashtagPlaceholder}
        helperText={copy.helperText}
        values={state.hashtags}
        error={state.errors.hashtags}
        copy={{
          requiredError: copy.hashtagRequired,
          duplicateError: copy.hashtagDuplicateError,
          maxError: copy.hashtagMaxError,
          createOption: copy.hashtagCreateOption,
          noResults: copy.noResultsLabel,
        }}
        onAdd={(tag) => dispatch({ type: "add-hashtag", tag })}
        onRemove={(tag) => dispatch({ type: "remove-hashtag", tag })}
      />

      <KudosImageUploader
        buttonLabel={copy.imageButtonLabel}
        images={state.images}
        copy={{
          invalidTypeError: copy.imageInvalidTypeError,
          sizeError: copy.imageSizeError,
          maxError: copy.imageMaxError,
        }}
        onAddImages={(imgs) => dispatch({ type: "add-images", images: imgs })}
        onRemoveImage={(id) => dispatch({ type: "remove-image", id })}
      />

      <KudosAnonymousToggle
        label={copy.anonymousLabel}
        aliasPlaceholder={copy.anonymousAliasPlaceholder}
        isAnonymous={state.isAnonymous}
        alias={state.anonymousAlias}
        onToggle={() => dispatch({ type: "toggle-anonymous" })}
        onAliasChange={(alias) => dispatch({ type: "set-alias", alias })}
      />

      <KudosComposerFooter
        cancelLabel={copy.cancelLabel}
        submitLabel={copy.submitLabel}
        submittingLabel={copy.submittingLabel}
        submitting={state.submitting}
        canSubmit={isValid}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
