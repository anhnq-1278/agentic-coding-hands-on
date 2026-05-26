"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

type ToastVariant = "success" | "error";

type Toast = {
  id: string;
  message: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  showToast: (message: string, variant?: ToastVariant) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_DURATION_MS = 3000;

/**
 * Lightweight toast host. Mounts once near the top of a page and exposes
 * `useToast()` to descendants. Auto-dismisses after `TOAST_DURATION_MS`.
 */
export function ToastHost({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<readonly Toast[]>([]);
  const idRef = useRef(0);

  const showToast = useCallback((message: string, variant: ToastVariant = "success") => {
    idRef.current += 1;
    const id = `toast-${idRef.current}`;
    setToasts((prev) => [...prev, { id, message, variant }]);
  }, []);

  useEffect(() => {
    if (toasts.length === 0) return;
    const head = toasts[0];
    const timer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== head.id));
    }, TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [toasts]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="polite"
        role="status"
        className="pointer-events-none fixed inset-x-0 top-24 z-50 flex flex-col items-center gap-2 px-4"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto rounded-lg px-4 py-2 text-sm font-bold shadow-lg ring-1 backdrop-blur ${
              t.variant === "success"
                ? "bg-saa-cta-bg/95 text-[#00101A] ring-saa-cta-bg"
                : "bg-red-500/95 text-white ring-red-500"
            }`}
            style={{
              fontFamily:
                "var(--font-montserrat), Montserrat, sans-serif",
            }}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Fallback so unit-test renders without ToastHost don't crash. Logs to
    // console when a toast would have fired.
    return {
      showToast: (message: string) => {
        if (typeof console !== "undefined") {
          console.info("[toast]", message);
        }
      },
    };
  }
  return ctx;
}
