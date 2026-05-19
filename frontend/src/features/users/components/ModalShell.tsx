import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";
import { FiX } from "react-icons/fi";

interface ModalShellProps {
  isOpen: boolean;
  onClose: () => void;
  title: ReactNode;
  maxWidth?: string;
  overlayClassName?: string;
  panelClassName?: string;
  children: ReactNode;
}

function ModalShell({
  isOpen,
  onClose,
  title,
  maxWidth = "max-w-2xl",
  overlayClassName,
  panelClassName,
  children,
}: ModalShellProps) {
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);

  // Animation: mount first, then show (enter); hide then unmount (exit)
  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      const t = setTimeout(() => setShown(true), 10);
      return () => clearTimeout(t);
    } else {
      setShown(false);
      const t = setTimeout(() => setMounted(false), 200);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Scroll lock + Escape key
  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-9999 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm transition-opacity duration-200 ${shown ? "opacity-100" : "opacity-0 pointer-events-none"} ${overlayClassName ?? ""}`}
      onClick={onClose}
    >
      <div
        className={`flex w-full ${maxWidth} max-h-[90vh] flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl transition-all duration-200 ${shown ? "scale-100 translate-y-0 opacity-100" : "scale-95 translate-y-2 opacity-0"} ${panelClassName ?? ""}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 p-2 text-slate-500 transition
           hover:bg-slate-100 hover:text-slate-700"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

export default ModalShell;
