import { useState } from "react";
import ModalShell from "../user/ModalShell";
import type { Leave } from "./LeavesTable";

interface AddLeaveFormValues {
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
}

interface AddLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formValues: AddLeaveFormValues) => Promise<void>;
  isSaving: boolean;
}

function AddLeaveModal({
  isOpen,
  onClose,
  onSave,
  isSaving,
}: AddLeaveModalProps) {
  const [formValues, setFormValues] = useState<AddLeaveFormValues>({
    type: "",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = event.target;
    setFormValues((currentValues) => ({ ...currentValues, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSave(formValues);
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Apply for Leave"
      maxWidth="max-w-xl"
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Leave Type
            </span>
            <select
              name="type"
              value={formValues.type}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
              required
            >
              <option value="">Select Leave Type</option>
              <option value="annual">Annual</option>
              <option value="sick">Sick</option>
              <option value="casual">Casual</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Start Date
            </span>
            <input
              type="date"
              name="startDate"
              value={formValues.startDate}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              End Date
            </span>
            <input
              type="date"
              name="endDate"
              value={formValues.endDate}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Reason
            </span>
            <textarea
              name="reason"
              value={formValues.reason}
              onChange={handleChange}
              placeholder="Reason for leave"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
              required
            />
          </label>
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
            type="submit"
            disabled={isSaving}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium
            text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {isSaving ? "Applying..." : "Apply"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

export type { AddLeaveFormValues };
export default AddLeaveModal;
