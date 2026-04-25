import React from "react";
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
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/59 bg-opacity-30"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-lg w-full max-w-3xl relative p-0"
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
