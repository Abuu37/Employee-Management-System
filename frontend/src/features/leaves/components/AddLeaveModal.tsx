import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { FiCalendar } from "react-icons/fi";
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

const leaveValidationSchema = Yup.object({
  type: Yup.string().required("Please select a leave type"),
  startDate: Yup.string().required("Start date is required"),
  endDate: Yup.string()
    .required("End date is required")
    .test(
      "is-after-start",
      "End date cannot be before start date",
      function (value) {
        const { startDate } = this.parent;
        if (!startDate || !value) return true;
        return new Date(value) >= new Date(startDate);
      },
    ),
  reason: Yup.string()
    .test(
      "not-empty-rich-text",
      "Reason is required",
      (value) => !isRichTextEmpty(value ?? ""),
    )
    .required("Reason is required"),
});

const fieldClass = (hasError: boolean) =>
  `w-full rounded-2xl border px-4 py-3 text-sm text-slate-900 outline-none transition ${
    hasError
      ? "border-red-500 bg-white focus:border-red-500"
      : "border-slate-200 bg-slate-50 focus:border-blue-500 focus:bg-white"
  }`;

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

  const formInitialValues: AddLeaveFormValues = {
    type: initialValues?.type ?? "",
    startDate: initialValues?.startDate ?? "",
    endDate: initialValues?.endDate ?? "",
    reason: initialValues?.reason ?? "",
    backupEmployeeId: initialValues?.backupEmployeeId ?? "",
    handoverNote: initialValues?.handoverNote ?? "",
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
            <FiCalendar className="h-4 w-4" />
          </span>
          {isEditMode ? t("leaves.editRequest") : t("leaves.applyLeave")}
        </span>
      }
      maxWidth="max-w-xl"
    >
      <Formik
        key={isOpen ? "open" : "closed"}
        enableReinitialize
        initialValues={formInitialValues}
        validationSchema={leaveValidationSchema}
        onSubmit={async (values) => {
          await onSave(values);
        }}
      >
        {({ errors, touched, values, setFieldValue }) => (
          <Form className="space-y-4">
            <div className="grid gap-3">
              {/* Leave Type */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {t("leaves.leaveType")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <Field
                  as="select"
                  name="type"
                  className={fieldClass(!!(errors.type && touched.type))}
                >
                  <option value="">{t("leaves.selectLeaveType")}</option>
                  <option value="annual">{t("leaves.annual")}</option>
                  <option value="sick">{t("leaves.sick")}</option>
                  <option value="casual">{t("leaves.casual")}</option>
                  <option value="emergency">{t("leaves.emergency")}</option>
                  <option value="unpaid">{t("leaves.unpaid")}</option>
                </Field>
                <ErrorMessage
                  name="type"
                  component="p"
                  className="mt-1 text-xs text-red-500"
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    {t("leaves.startDate")}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <Field
                    type="date"
                    name="startDate"
                    className={fieldClass(
                      !!(errors.startDate && touched.startDate),
                    )}
                  />
                  <ErrorMessage
                    name="startDate"
                    component="p"
                    className="mt-1 text-xs text-red-500"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    {t("leaves.endDate")}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <Field
                    type="date"
                    name="endDate"
                    className={fieldClass(
                      !!(errors.endDate && touched.endDate),
                    )}
                  />
                  <ErrorMessage
                    name="endDate"
                    component="p"
                    className="mt-1 text-xs text-red-500"
                  />
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {t("leaves.reason")} <span className="text-red-500">*</span>
                </label>
                <div
                  className={`rounded-2xl border transition ${
                    errors.reason && touched.reason
                      ? "border-red-500"
                      : "border-slate-200"
                  }`}
                >
                  <RichTextEditor
                    value={values.reason}
                    onChange={(content) => setFieldValue("reason", content)}
                    placeholder="Reason for leave"
                    height="85px"
                    simple
                  />
                </div>
                <ErrorMessage
                  name="reason"
                  component="p"
                  className="mt-1 text-xs text-red-500"
                />
              </div>

              {/* Backup / Handover */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {t("leaves.handoverBackup")}
                </label>
                <Field
                  as="select"
                  name="backupEmployeeId"
                  className={fieldClass(false)}
                >
                  <option value="">{t("leaves.selectColleague")}</option>
                  {colleagues.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Field>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {t("leaves.handoverNotes")}
                </label>
                <div className="rounded-2xl border border-slate-200">
                  <RichTextEditor
                    value={values.handoverNote}
                    onChange={(content) =>
                      setFieldValue("handoverNote", content)
                    }
                    placeholder={t("leaves.handoverPlaceholder")}
                    height="80px"
                    simple
                  />
                </div>
              </div>
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
                disabled={isSaving}
                className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                {isSaving ? t("leaves.applying") : t("leaves.apply")}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </ModalShell>
  );
}

export type { AddLeaveFormValues };
export default AddLeaveModal;
