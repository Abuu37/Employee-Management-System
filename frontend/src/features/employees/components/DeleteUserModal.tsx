import ModalShell from "./ModalShell";
import type { User } from "./types";

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  user: User | null;
  isDeleting: boolean;
}

function DeleteUserModal({
  isOpen,
  onClose,
  onConfirm,
  user,
  isDeleting,
}: DeleteUserModalProps) {
  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Delete User"
      maxWidth="max-w-lg"
    >
      {user ? (
        <div className="space-y-5">
          <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-4">
            <p className="text-sm font-medium text-red-700">
              This will permanently remove {user.name}.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
            <p>
              <span className="font-semibold text-slate-900">Email:</span>{" "}
              {user.email}
            </p>
            <p className="mt-1">
              <span className="font-semibold capitalize text-slate-900">
                Role:
              </span>{" "}
              {user.role}
            </p>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
            >
              {isDeleting ? "Deleting..." : "Delete User"}
            </button>
          </div>
        </div>
      ) : null}
    </ModalShell>
  );
}

export default DeleteUserModal;
