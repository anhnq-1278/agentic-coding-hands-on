"use client";

import { useCallback, useReducer } from "react";
import { useSWRConfig } from "swr";
import { useToast } from "@/components/feedback/toast-host";
import { KUDOS_ENDPOINTS } from "@/lib/kudos/cache-keys";
import type { ComposerDraft, UploadedImage } from "@/lib/kudos/types";

export type ComposerErrorMap = {
  recipient: string | null;
  headline: string | null;
  message: string | null;
  hashtags: string | null;
  images: string | null;
  anonymousAlias: string | null;
  form: string | null;
};

export type RecipientSelection = { id: string; displayName: string } | null;

export type ComposerState = {
  recipient: RecipientSelection;
  recipientQuery: string;
  headline: string;
  contentMarkdown: string;
  hashtags: string[];
  images: UploadedImage[];
  isAnonymous: boolean;
  anonymousAlias: string;
  submitting: boolean;
  errors: ComposerErrorMap;
};

export const INITIAL_STATE: ComposerState = {
  recipient: null,
  recipientQuery: "",
  headline: "",
  contentMarkdown: "",
  hashtags: [],
  images: [],
  isAnonymous: false,
  anonymousAlias: "",
  submitting: false,
  errors: {
    recipient: null,
    headline: null,
    message: null,
    hashtags: null,
    images: null,
    anonymousAlias: null,
    form: null,
  },
};

const MAX_HASHTAGS = 5;
const MAX_IMAGES = 5;

export type ComposerAction =
  | { type: "set-recipient"; recipient: RecipientSelection }
  | { type: "set-recipient-query"; query: string }
  | { type: "set-headline"; headline: string }
  | { type: "set-content"; markdown: string }
  | { type: "add-hashtag"; tag: string }
  | { type: "remove-hashtag"; tag: string }
  | { type: "add-images"; images: UploadedImage[] }
  | { type: "remove-image"; id: string }
  | { type: "toggle-anonymous" }
  | { type: "set-alias"; alias: string }
  | { type: "start-submit" }
  | { type: "submit-error"; errors: Partial<ComposerErrorMap> }
  | { type: "reset" };

function normaliseTag(raw: string): string {
  return raw.trim().replace(/^#+/, "").trim();
}

export function composerReducer(
  state: ComposerState,
  action: ComposerAction,
): ComposerState {
  switch (action.type) {
    case "set-recipient":
      return {
        ...state,
        recipient: action.recipient,
        recipientQuery: action.recipient?.displayName ?? "",
        errors: { ...state.errors, recipient: null },
      };
    case "set-recipient-query":
      return { ...state, recipientQuery: action.query };
    case "set-headline":
      return {
        ...state,
        headline: action.headline,
        errors: { ...state.errors, headline: null },
      };
    case "set-content":
      return {
        ...state,
        contentMarkdown: action.markdown,
        errors: { ...state.errors, message: null },
      };
    case "add-hashtag": {
      const tag = normaliseTag(action.tag);
      if (tag.length === 0) return state;
      if (state.hashtags.length >= MAX_HASHTAGS) {
        return {
          ...state,
          errors: { ...state.errors, hashtags: "MAX" },
        };
      }
      const isDup = state.hashtags.some(
        (existing) => existing.toLowerCase() === tag.toLowerCase(),
      );
      if (isDup) {
        return {
          ...state,
          errors: { ...state.errors, hashtags: "DUPLICATE" },
        };
      }
      return {
        ...state,
        hashtags: [...state.hashtags, tag],
        errors: { ...state.errors, hashtags: null },
      };
    }
    case "remove-hashtag":
      return {
        ...state,
        hashtags: state.hashtags.filter(
          (t) => t.toLowerCase() !== action.tag.toLowerCase(),
        ),
        errors: { ...state.errors, hashtags: null },
      };
    case "add-images": {
      const available = MAX_IMAGES - state.images.length;
      const accepted = action.images.slice(0, Math.max(0, available));
      return {
        ...state,
        images: [...state.images, ...accepted],
        errors: { ...state.errors, images: null },
      };
    }
    case "remove-image": {
      const target = state.images.find((img) => img.id === action.id);
      if (target) {
        // Revoke preview URL to free memory.
        try {
          URL.revokeObjectURL(target.previewUrl);
        } catch {
          /* noop in jsdom */
        }
      }
      return {
        ...state,
        images: state.images.filter((img) => img.id !== action.id),
        errors: { ...state.errors, images: null },
      };
    }
    case "toggle-anonymous":
      return {
        ...state,
        isAnonymous: !state.isAnonymous,
        // Reset alias when unchecking
        anonymousAlias: !state.isAnonymous ? state.anonymousAlias : "",
        errors: { ...state.errors, anonymousAlias: null },
      };
    case "set-alias":
      // Only meaningful when isAnonymous is true. Reducer accepts in both
      // cases (caller may dispatch eagerly), but stored alias is reset on
      // toggle-off.
      return {
        ...state,
        anonymousAlias: action.alias,
        errors: { ...state.errors, anonymousAlias: null },
      };
    case "start-submit":
      return { ...state, submitting: true, errors: INITIAL_STATE.errors };
    case "submit-error":
      return {
        ...state,
        submitting: false,
        errors: { ...state.errors, ...action.errors },
      };
    case "reset":
      // Revoke any outstanding object URLs.
      for (const img of state.images) {
        try {
          URL.revokeObjectURL(img.previewUrl);
        } catch {
          /* noop */
        }
      }
      return INITIAL_STATE;
  }
}

export function isComposerValid(state: ComposerState): boolean {
  return (
    state.recipient !== null &&
    state.headline.trim().length > 0 &&
    state.contentMarkdown.trim().length > 0 &&
    state.hashtags.length > 0 &&
    !state.submitting
  );
}

type SubmitOptions = {
  onSuccess?: () => void;
};

/**
 * Composer hook — owns the reducer + the submit flow. Submit uploads
 * images first (multipart), then POSTs the Kudos. On success, mutates
 * the SWR cache family and calls `onSuccess`.
 */
export function useKudosComposer({
  initialRecipient,
}: {
  initialRecipient?: RecipientSelection;
} = {}) {
  const [state, dispatch] = useReducer(composerReducer, INITIAL_STATE, (s) =>
    initialRecipient
      ? {
          ...s,
          recipient: initialRecipient,
          recipientQuery: initialRecipient.displayName,
        }
      : s,
  );
  const { mutate } = useSWRConfig();
  const { showToast } = useToast();

  const submit = useCallback(
    async (
      { onSuccess }: SubmitOptions = {},
      messages?: {
        submitErrorMessage: string;
        networkErrorMessage: string;
        submitSuccessToast: string;
      },
    ) => {
      if (state.recipient === null) return;
      dispatch({ type: "start-submit" });

      // 1. Upload images (if any) via multipart
      let imageUrls: string[] = [];
      if (state.images.length > 0) {
        try {
          const form = new FormData();
          for (const img of state.images) {
            form.append("images", img.file);
          }
          const uploadRes = await fetch("/api/kudos/uploads", {
            method: "POST",
            body: form,
            credentials: "include",
          });
          if (!uploadRes.ok) {
            const detail = await uploadRes.json().catch(() => ({}));
            dispatch({
              type: "submit-error",
              errors: { images: (detail as { error?: string }).error ?? "Upload failed" },
            });
            showToast(messages?.submitErrorMessage ?? "Error", "error");
            return;
          }
          const uploaded = (await uploadRes.json()) as { urls: string[] };
          imageUrls = uploaded.urls;
        } catch {
          dispatch({
            type: "submit-error",
            errors: { form: "NETWORK" },
          });
          showToast(messages?.networkErrorMessage ?? "Network error", "error");
          return;
        }
      }

      // 2. POST the Kudos
      const draft: ComposerDraft = {
        recipientId: state.recipient.id,
        headline: state.headline.trim(),
        message: state.contentMarkdown.trim(),
        hashtags: state.hashtags,
        images: imageUrls,
        isAnonymous: state.isAnonymous,
        anonymousAlias: state.isAnonymous
          ? state.anonymousAlias.trim() || null
          : null,
      };

      try {
        const res = await fetch("/api/kudos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(draft),
        });
        if (!res.ok) {
          const detail = await res.json().catch(() => ({}));
          const err = (detail as { error?: string }).error ?? "";
          const errors: Partial<ComposerErrorMap> = {};
          if (err.startsWith("RECIPIENT_IS_SELF")) {
            errors.recipient = "SELF";
          } else if (err.toLowerCase().includes("recipient")) {
            errors.recipient = "REQUIRED";
          } else if (err.toLowerCase().includes("headline")) {
            errors.headline = "REQUIRED";
          } else if (err.toLowerCase().includes("message")) {
            errors.message = "REQUIRED";
          } else if (err.toLowerCase().includes("hashtag")) {
            errors.hashtags = "REQUIRED";
          } else {
            errors.form = err || "FORM";
          }
          dispatch({ type: "submit-error", errors });
          showToast(messages?.submitErrorMessage ?? "Error", "error");
          return;
        }

        // 3. Invalidate SWR caches so the new Kudos appears in the feed.
        await Promise.all([
          mutate(
            (key) =>
              typeof key === "string" &&
              (key.startsWith(KUDOS_ENDPOINTS.feed) ||
                key.startsWith(KUDOS_ENDPOINTS.highlight) ||
                key.startsWith(KUDOS_ENDPOINTS.spotlight)),
            undefined,
            { revalidate: true },
          ),
          mutate(KUDOS_ENDPOINTS.usersMe),
        ]);

        showToast(messages?.submitSuccessToast ?? "Sent!", "success");
        dispatch({ type: "reset" });
        onSuccess?.();
      } catch {
        dispatch({ type: "submit-error", errors: { form: "NETWORK" } });
        showToast(messages?.networkErrorMessage ?? "Network error", "error");
      }
    },
    [
      state.recipient,
      state.headline,
      state.contentMarkdown,
      state.hashtags,
      state.images,
      state.isAnonymous,
      state.anonymousAlias,
      mutate,
      showToast,
    ],
  );

  return { state, dispatch, submit, isValid: isComposerValid(state) };
}
