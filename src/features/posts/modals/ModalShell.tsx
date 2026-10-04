"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { IconX } from "@tabler/icons-react";

interface ModalShellProps {
  testId: string;
  closeTestId: string;
  title: string;
  icon: ReactNode;
  onClose: () => void;
  children: ReactNode;
}

// Kerangka modal bersama: overlay, judul, tombol tutup, kunci scroll body,
// tombol Esc, klik di luar panel, dan pengelolaan fokus.
function ModalShell({ testId, closeTestId, title, icon, onClose, children }: ModalShellProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  // Selalu pakai fungsi tutup terbaru tanpa memasang ulang event listener
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const previouslyFocused = document.activeElement;
    panelRef.current?.focus();
    document.body.style.overflow = "hidden";

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onCloseRef.current();
    }
    document.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKey);
      // Kembalikan fokus ke elemen yang membuka modal
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, []);

  return (
    <div
      data-testid={testId}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-800/50"
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className="w-full sm:max-w-lg max-h-[92vh] overflow-y-auto bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl focus:outline-none"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            {icon}
            <h2 className="font-display text-lg font-bold text-slate-800">{title}</h2>
          </div>
          <button
            type="button"
            data-testid={closeTestId}
            onClick={onClose}
            aria-label="Tutup"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <IconX size={18} aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default ModalShell;