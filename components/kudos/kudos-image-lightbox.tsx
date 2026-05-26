"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

type Props = {
  src: string | null;
  onClose: () => void;
};

/**
 * Minimal image lightbox. Renders the selected gallery image full-width
 * inside a native `<dialog>` so it inherits the platform's focus-trap +
 * Esc-to-close behavior. Click outside the image area also closes.
 */
export function KudosImageLightbox({ src, onClose }: Props) {
  const ref = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const dlg = ref.current;
    if (!dlg) return;
    if (src && !dlg.open) {
      dlg.showModal();
    } else if (!src && dlg.open) {
      dlg.close();
    }
  }, [src]);

  return (
    <dialog
      ref={ref}
      aria-modal="true"
      onClose={onClose}
      onClick={(e) => {
        // Click on the backdrop (the dialog itself, not its inner image)
        // closes the modal.
        if (e.target === ref.current) {
          onClose();
        }
      }}
      className="m-0 max-h-[100dvh] max-w-[100vw] bg-transparent p-0 backdrop:bg-[#00101A]/80 backdrop:backdrop-blur"
    >
      {src && (
        <div className="flex h-full max-h-[100dvh] w-full items-center justify-center p-6">
          <Image
            src={src}
            alt=""
            width={1200}
            height={1200}
            className="h-auto max-h-[90vh] w-auto max-w-[90vw] rounded-md object-contain"
          />
        </div>
      )}
    </dialog>
  );
}
