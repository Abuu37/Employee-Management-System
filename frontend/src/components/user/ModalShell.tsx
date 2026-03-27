import { useEffect } from "react";
import type { ReactNode } from "react";
import { FiX } from "react-icons/fi";

interface ModalShellProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
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

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

      // Prevent background scrolling when modal is open
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
 
    // Close modal on Escape key press
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

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm ${overlayClassName ?? ""}`}
      onClick={onClose}
    >
      <div
        className={`w-full ${maxWidth} rounded-3xl border border-slate-200 bg-white shadow-2xl ${panelClassName ?? ""}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

export default ModalShell;
