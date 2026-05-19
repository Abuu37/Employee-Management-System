import { useEffect, useState } from "react";
import ModalShell from "@/features/users/components/ModalShell";
import { useTranslation } from "react-i18next";
import RichTextEditor from "@/components/editor/RichTextEditor";
import { isRichTextEmpty } from "@/utils/richText";

interface Colleague {
  id: number;
  name: string;
}

interface AddLeaveFormValues {
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
  backupEmployeeId: string;
  handoverNote: string;
}

interface AddLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formValues: AddLeaveFormValues) => Promise<void>;
  isSaving: boolean;
  colleagues: Colleague[];
  isEditMode?: boolean;
  initialValues?: Partial<AddLeaveFormValues>;
}

// Default empty form values
const EMPTY_FORM: AddLeaveFormValues = {
  type: "",
  startDate: "",
  endDate: "",
  reason: "",
  backupEmployeeId: "",
  handoverNote: "",
};

function AddLeaveModal({
  isOpen,
  onClose,
  onSave,
  isSaving,
  colleagues,
  isEditMode = false,
  initialValues,
}: AddLeaveModalProps) {
  const { t } = useTranslation();
  const [formValues, setFormValues] = useState<AddLeaveFormValues>(EMPTY_FORM);

  useEffect(() => {
    if (!isOpen) return;
    setFormValues({
      ...EMPTY_FORM,
      ...initialValues,
    });
  }, [isOpen, initialValues]);

  // Generic change handler for all form fields
  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  //========== Form submission handler ==========
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSave(formValues);
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? t("leaves.editRequest") : t("leaves.applyLeave")}
      maxWidth="max-w-xl"
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-4">
          {/* Leave Type */}
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              {t("leaves.leaveType")} <span className="text-red-500">*</span>
            </span>
            <select
              name="type"
              value={formValues.type}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
              required
            >
              <option value="">{t("leaves.selectLeaveType")}</option>
              <option value="annual">{t("leaves.annual")}</option>
              <option value="sick">{t("leaves.sick")}</option>
              <option value="casual">{t("leaves.casual")}</option>
              <option value="emergency">{t("leaves.emergency")}</option>
              <option value="unpaid">{t("leaves.unpaid")}</option>
            </select>
          </label>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                {t("leaves.startDate")} <span className="text-red-500">*</span>
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
                {t("leaves.endDate")} <span className="text-red-500">*</span>
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
          </div>

          {/* Reason */}
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              {t("leaves.reason")} <span className="text-red-500">*</span>
            </span>
            <RichTextEditor
              value={formValues.reason}
              onChange={(content) =>
                setFormValues((prev) => ({ ...prev, reason: content }))
              }
              placeholder="Reason for leave"
              height="110px"
              simple
            />
          </label>

          {/* ========== Backup / Handover fields ========== */}
          <>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                {t("leaves.handoverBackup")}
              </span>
              <select
                name="backupEmployeeId"
                value={formValues.backupEmployeeId}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
              >
                <option value="">{t("leaves.selectColleague")}</option>
                {colleagues.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                {t("leaves.handoverNotes")}
              </span>
              <RichTextEditor
                value={formValues.handoverNote}
                onChange={(content) =>
                  setFormValues((prev) => ({ ...prev, handoverNote: content }))
                }
                placeholder={t("leaves.handoverPlaceholder")}
                height="105px"
                simple
              />
            </label>
          </>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            {t("common.cancel")}
          </button>
          <button
            type="submit"
            disabled={isSaving || isRichTextEmpty(formValues.reason)}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {isSaving ? t("leaves.applying") : t("leaves.apply")}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

export type { AddLeaveFormValues };
export default AddLeaveModal;
