import React, { useEffect, useState } from "react";
interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const CommentModal: React.FC<CommentModalProps> = ({
  isOpen,
  onClose,
  children,
}) => {
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);

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

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-200 ${shown ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-2xl shadow-lg w-full max-w-3xl relative p-0 transition-all duration-200 ${shown ? "scale-100 translate-y-0 opacity-100" : "scale-95 translate-y-2 opacity-0"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b px-6 py-4 rounded-t-2xl">
          <h2 className="text-lg font-semibold">Task Comments</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Close"
          >
            <span className="align-middle">&#10005;</span>
          </button>
        </div>
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  );
};

export default CommentModal;
