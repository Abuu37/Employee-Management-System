import { useEffect, useState } from "react";
import axios from "@/services/axios";
import { useTranslation } from "react-i18next";
import ModalShell from "../../users/components/ModalShell";
import { DeptFormValues, Department } from "../types";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";


interface Manager {
  id: number;
  name: string;
  department?: string | null;
}

interface EditDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (values: DeptFormValues) => Promise<void>;
  department: Department | null;
  isSaving: boolean;
}

const validationSchema = Yup.object ({
  name: Yup.string().required("Department name is required"),
  code: Yup.string().required("Department code is required"),
  manager_id: Yup.number().nullable().required("Manager is required"),
  status: Yup.string().oneOf(["active", "inactive"]).required("Status is required"),

});


export default function EditDepartmentModal({
  isOpen,
  onClose,
  onSave,
  department,
  isSaving,
}: EditDepartmentModalProps) {
  const [managers, setManagers] = useState<Manager[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    if (!isOpen || !department) return;
    axios .get("/user/view-users") .then((r) => {
        const mgrs = (Array.isArray(r.data) ? r.data : []).filter(
          (u: any) => u.role === "manager",
        );
        setManagers(mgrs);
      })
      .catch(() => {});
  }, [isOpen, department]);


  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={t("departments.editTitle")}
      maxWidth="max-w-lg"
    >

    <Formik
    enableReinitialize
    initialValues={{
      name: department?.name || "",
      code: department?.code || "",
      manager_id: department?.manager_id ?? "",
      status: department?.status || "active",
    }}
    validationSchema={validationSchema}
    onSubmit={
      async (values) => {
        await onSave({
          ...values,
          manager_id: values.manager_id
          ?Number(values.manager_id)
          :null,
        });
      }
    }
    >
      {( { errors, touched }) => (

      <Form className="space-y-4">
        <div className="grid grid-cols-2 gap-4">

          {/*============  Department Name  ================= */}
          <label className="col-span-2 block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              {t("departments.departmentName")}{" "}
              <span className="text-red-500">*</span>
            </span>
            <Field
              type="text"
              name="name"
              className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none
                ${errors.name && touched.name
                  ? "border-red-500 "
                  : "border-slate-200 bg-slate-50 focus:border-blue-500"
                }`}
            />
             <ErrorMessage
                name="name"
                component="div"
                className="mt-1 text-sm text-red-500"
              /> 
          </label>


            {/*============  Department Code  ================= */}

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              {t("departments.departmentCode")}{" "}
              <span className="text-red-500">*</span>
            </span>
            <Field
              type="text"
              name="code"
              className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none
                ${errors.code && touched.code
                  ? "border-red-500 "
                  : "border-slate-200 bg-slate-50 focus:border-blue-500"
                }`}
             />

             <ErrorMessage
                name="code"
                component="div"
                className="mt-1 text-sm text-red-500"
              /> 
          </label>

            {/*============  Status  ================= */}

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              {t("common.status")}
            </span>
            <Field
              as="select"
              name="status"
              className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none
                ${errors.status && touched.status
                  ? "border-red-500 "
                    : "border-slate-200 bg-slate-50 focus:border-blue-500"  
                }`} 
             >
              <option value="active">{t("departments.active")}</option>
              <option value="inactive">{t("departments.inactive")}</option>
            </Field>
              <ErrorMessage
              name="status"
              component="div"
              className="mt-1 text-sm text-red-500"
               /> 
          </label>

          {/*============  Manager Selection  ================= */  }

          <label className="col-span-2 block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              {t("departments.selectManager")}
            </span>
            <Field
              as="select"
              name="manager_id"
              className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none
                ${errors.manager_id && touched.manager_id
                  ? "border-red-500 "
                  : "border-slate-200 bg-slate-50 focus:border-blue-500"
                }`} 
            >
              <option value="">{t("departments.noManager")}</option>
              {managers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                  {m.department ? ` (${m.department})` : ""}
                </option>
              ))}
            </Field>
              <ErrorMessage
              name="manager_id"
              component="div"
              className="mt-1 text-sm text-red-500"
                />
          </label>
        </div>

          {/*============  Buttons  ================= */ }  

        <div className="flex justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            {t("common.cancel")}
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-300"
          >
            {isSaving ? t("departments.saving") : t("departments.saveChanges")}
          </button>
        </div>
      </Form>

         )}
      </Formik>
    </ModalShell>
  );
}
