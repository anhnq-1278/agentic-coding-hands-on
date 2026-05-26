"use client";

import Image from "next/image";
import { useRef } from "react";
import { useToast } from "@/components/feedback/toast-host";
import type { UploadedImage } from "@/lib/kudos/types";
import {
  ALLOWED_IMAGE_MIMES,
  MAX_IMAGE_BYTES,
  MAX_IMAGE_COUNT,
} from "@/lib/kudos/uploads.types";

type Props = {
  buttonLabel: string;
  images: readonly UploadedImage[];
  copy: {
    invalidTypeError: string;
    sizeError: string;
    maxError: string;
  };
  onAddImages: (images: UploadedImage[]) => void;
  onRemoveImage: (id: string) => void;
};

let imgIdCounter = 0;

const LABEL = "Image";
const MAX_LABEL = "Tối đa 5";

/**
 * `F_Frame 537` image row (Figma `I520:11647;520:9896`):
 *   - Label "Image" on the left
 *   - Thumbnails (with red × overlay) inline
 *   - White outlined `+ Image` button with "Tối đa 5" subline; hides
 *     when 5 images are queued.
 */
export function KudosImageUploader({
  buttonLabel,
  images,
  copy,
  onAddImages,
  onRemoveImage,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { showToast } = useToast();
  const atCap = images.length >= MAX_IMAGE_COUNT;

  function handleFiles(fileList: FileList | null) {
    if (!fileList) return;
    const next: UploadedImage[] = [];
    const remainingSlots = MAX_IMAGE_COUNT - images.length;
    for (const file of Array.from(fileList).slice(0, remainingSlots)) {
      if (!ALLOWED_IMAGE_MIMES.has(file.type)) {
        showToast(copy.invalidTypeError, "error");
        continue;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        showToast(copy.sizeError, "error");
        continue;
      }
      imgIdCounter += 1;
      next.push({
        id: `img-${imgIdCounter}`,
        file,
        previewUrl: URL.createObjectURL(file),
        status: "pending",
      });
    }
    if (next.length > 0) {
      onAddImages(next);
    }
    if (fileList.length > remainingSlots) {
      showToast(copy.maxError, "error");
    }
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div className="flex w-full items-center gap-6">
      <label className="w-32 shrink-0 text-base font-bold leading-6 text-[#00101A]">
        {LABEL}
      </label>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        multiple
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />
      <div className="flex flex-1 flex-wrap items-center gap-3 pt-2">
        {images.map((img) => (
          <div
            key={img.id}
            className="relative h-20 w-20"
          >
            <div className="h-20 w-20 overflow-hidden rounded-md border border-[#998C5F]">
              <Image
                src={img.previewUrl}
                alt=""
                width={80}
                height={80}
                unoptimized
                className="h-full w-full object-cover"
              />
            </div>
            <button
              type="button"
              aria-label="Remove image"
              onClick={() => onRemoveImage(img.id)}
              className="absolute right-0 top-0 z-10 inline-flex h-5 w-5 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full bg-[#D4271D] text-white shadow-sm transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-saa-cta-bg"
            >
              <CloseTiny />
            </button>
          </div>
        ))}
        {!atCap && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-14 flex-col items-center justify-center rounded-lg border border-[#998C5F] bg-white px-5 transition-colors hover:border-saa-cta-bg"
          >
            <span className="text-base font-bold text-[#00101A]">
              <span className="mr-1">+</span>
              {buttonLabel.replace(/^\+\s*/, "")}
            </span>
            <span className="text-xs font-medium text-[#999999]">
              {MAX_LABEL}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

function CloseTiny() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
