import { useTranslation } from "react-i18next";
import { FiUser, FiBriefcase } from "react-icons/fi";
import { Field, ErrorMessage, useFormikContext } from "formik";

type ActiveTab = "personal" | "work";

type FormValues = {
  name: string;
  email: string;
  phone?: string;
  gender?: string;
  date_of_birth?: string;
  address?: string;
  emergency_contact?: string;
  department?: string;
  department_id?: number;
  position?: string;
  manager_id?: number;
  employment_type?: string;
  office_branch?: string;
  status?: string;
};

interface EmployeeFormSectionProps {
  departments: { id: number; name: string }[];
  managers: { id: number; name: string; department?: string }[];
  loadingManagers: boolean;
  managerError?: string;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentUserRole: string | null;
}

const fieldClass = (hasError: boolean) =>
  `w-full rounded-xl border px-3 py-2 text-sm text-slate-900 outline-none transition ${
    hasError
      ? "border-red-500 focus:border-red-500"
      : "border-slate-200 bg-slate-50 focus:border-blue-500 focus:bg-white"
  }`;

const EmployeeFormSection = ({
  departments,
  managers,
  loadingManagers,
  managerError,
  activeTab,
  setActiveTab,
  currentUserRole,
}: EmployeeFormSectionProps) => {
  const { t } = useTranslation();
  const { values, errors, touched, setFieldValue, setFieldTouched } =
    useFormikContext<FormValues>();

  return (
    <section className="space-y-3">
      {/* Sliding tab switcher */}
      <div className="relative flex rounded-full border border-slate-200 bg-slate-100 p-1">
        <div
          className="pointer-events-none absolute top-1 bottom-1 rounded-full bg-blue-600 shadow-sm transition-all duration-300 ease-in-out"
          style={{
            left: activeTab === "personal" ? "4px" : "50%",
            width: "calc(50% - 4px)",
          }}
        />
        <button
          type="button"
          onClick={() => setActiveTab("personal")}
          className="relative z-10 flex flex-1 items-center justify-center gap-2 rounded-full
           px-3 py-1.5 text-sm font-medium transition-colors duration-300"
        >
          <span
            className={`inline-flex h-5 w-5 items-center justify-center rounded-full border text-[11px] transition-colors duration-300 ${
              activeTab === "personal"
                ? "border-white bg-white text-blue-600"
                : "border-slate-300 bg-slate-200 text-slate-600"
            }`}
          >
            <FiUser className="h-3 w-3" />
          </span>
          <span
            className={`transition-colors duration-300 ${activeTab === "personal" ? "text-white" : "text-slate-600"}`}
          >
            Personal Info
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("work")}
          className="relative z-10 flex flex-1 items-center justify-center gap-2 rounded-full px-3
           py-1.5 text-sm font-medium transition-colors duration-300"
        >
          <span
            className={`inline-flex h-5 w-5 items-center justify-center rounded-full border text-[11px] transition-colors duration-300 ${
              activeTab === "work"
                ? "border-white bg-white text-blue-600"
                : "border-slate-300 bg-slate-200 text-slate-600"
            }`}
          >
            <FiBriefcase className="h-3 w-3" />
          </span>
          <span
            className={`transition-colors duration-300 ${activeTab === "work" ? "text-white" : "text-slate-600"}`}
          >
            Work Info
          </span>
        </button>
      </div>

      {/*============ Personal Tab ============*/}
      {activeTab === "personal" ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-3">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <FiUser className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900">
                Personal Information
              </h4>
              <p className="text-sm text-slate-500">
                Basic identity and contact details.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <tbody>
                {/* Name */}
                <tr className="border-b border-slate-200">
                  <td className="w-36 px-2 py-1.5 text-sm font-medium text-slate-700">
                    {t("employees.fullName")}{" "}
                    <span className="text-red-500">*</span>
                  </td>
                  <td className="px-2 py-1">
                    <Field
                      type="text"
                      name="name"
                      className={fieldClass(!!(errors.name && touched.name))}
                      placeholder="e.g. John Doe"
                    />
                    <ErrorMessage
                      name="name"
                      component="p"
                      className="mt-1 text-xs text-red-500"
                    />
                  </td>
                </tr>

                {/* Email */}
                <tr className="border-b border-slate-200">
                  <td className="px-2 py-1.5 text-sm font-medium text-slate-700">
                    {t("employees.emailAddress")}{" "}
                    <span className="text-red-500">*</span>
                  </td>
                  <td className="px-2 py-1">
                    <Field
                      type="email"
                      name="email"
                      className={fieldClass(!!(errors.email && touched.email))}
                      placeholder="e.g. john.doe@gmail.com"
                    />
                    <ErrorMessage
                      name="email"
                      component="p"
                      className="mt-1 text-xs text-red-500"
                    />
                  </td>
                </tr>

                {/* Phone */}
                <tr className="border-b border-slate-200">
                  <td className="px-2 py-1.5 text-sm font-medium text-slate-700">
                    Phone Number <span className="text-red-500">*</span>
                  </td>
                  <td className="px-2 py-1">
                    <Field
                      type="tel"
                      name="phone"
                      className={fieldClass(!!(errors.phone && touched.phone))}
                      placeholder="e.g. +255 7178 128 45"
                    />
                    <ErrorMessage
                      name="phone"
                      component="p"
                      className="mt-1 text-xs text-red-500"
                    />
                  </td>
                </tr>

                {/* Gender */}
                <tr className="border-b border-slate-200">
                  <td className="px-2 py-1.5 text-sm font-medium text-slate-700">
                    Gender <span className="text-red-500">*</span>
                  </td>
                  <td className="px-2 py-1">
                    <Field
                      as="select"
                      name="gender"
                      className={fieldClass(
                        !!(errors.gender && touched.gender),
                      )}
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </Field>
                    <ErrorMessage
                      name="gender"
                      component="p"
                      className="mt-1 text-xs text-red-500"
                    />
                  </td>
                </tr>

                {/* Date of Birth */}
                <tr className="border-b border-slate-200">
                  <td className="px-2 py-1.5 text-sm font-medium text-slate-700">
                    Date of Birth <span className="text-red-500">*</span>
                  </td>
                  <td className="px-2 py-1">
                    <Field
                      type="date"
                      name="date_of_birth"
                      max={new Date().toISOString().split("T")[0]} //
                      className={fieldClass(
                        !!(errors.date_of_birth && touched.date_of_birth),
                      )}
                    />
                    <ErrorMessage
                      name="date_of_birth"
                      component="p"
                      className="mt-1 text-xs text-red-500"
                    />
                  </td>
                </tr>

                {/* Address */}
                <tr className="border-b border-slate-200">
                  <td className="px-2 py-1.5 text-sm font-medium text-slate-700">
                    Address
                  </td>
                  <td className="px-2 py-1">
                    <Field
                      type="text"
                      name="address"
                      className={fieldClass(false)}
                      placeholder="e.g. 123 Main St, City, State"
                    />
                  </td>
                </tr>

                {/* Emergency Contact */}
                <tr>
                  <td className="px-2 py-1.5 text-sm font-medium text-slate-700">
                    Emergency
                  </td>
                  <td className="px-2 py-1">
                    <Field
                      type="text"
                      name="emergency_contact"
                      className={fieldClass(false)}
                      placeholder="e.g. Jane Doe — +255 7178 128 46"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {/*============ Work Tab ============*/}
      {activeTab === "work" ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-3">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-200 text-slate-700">
              <FiBriefcase className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900">
                Work Information
              </h4>
              <p className="text-sm text-slate-500">
                Company-related assignment details.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <tbody>
                {/* Department */}
                <tr className="border-b border-slate-200">
                  <td className="w-36 px-2 py-1.5 text-sm font-medium text-slate-700">
                    Department <span className="text-red-500">*</span>
                  </td>
                  <td className="px-2 py-1">
                    <select
                      name="department_id"
                      value={values.department_id ?? ""}
                      onChange={(e) => { const id = e.target.value ? Number(e.target.value)
                          : undefined;
                        setFieldValue("department_id", id);
                        const dept = departments.find((d) => d.id === id);
                        setFieldValue("department", dept?.name ?? "");
                      }}
                      onBlur={() => setFieldTouched("department_id", true)}
                      className={fieldClass(
                        !!(errors.department_id && touched.department_id),
                      )}
                    >
                      <option value="">Select department</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                    <ErrorMessage
                      name="department_id"
                      component="p"
                      className="mt-1 text-xs text-red-500"
                    />
                  </td>
                </tr>

                {/* Position */}
                <tr className="border-b border-slate-200">
                  <td className="px-2 py-1.5 text-sm font-medium text-slate-700">
                    {t("employees.position")}{" "}
                    <span className="text-red-500">*</span>
                  </td>
                  <td className="px-2 py-1">
                    <Field
                      type="text"
                      name="position"
                      className={fieldClass(
                        !!(errors.position && touched.position),
                      )}
                      placeholder="e.g. Software Engineer"
                    />
                    <ErrorMessage
                      name="position"
                      component="p"
                      className="mt-1 text-xs text-red-500"
                    />
                  </td>
                </tr>

                {/* Manager — admin only */}
                {currentUserRole === "admin" && (
                  <tr className="border-b border-slate-200">
                    <td className="px-2 py-1.5 text-sm font-medium text-slate-700">
                      {t("employees.assignManager")}
                    </td>
                    <td className="px-2 py-1">
                      {loadingManagers ? (
                        <div className="text-xs text-slate-500">
                          {t("employees.loadingManagers")}
                        </div>
                      ) : managerError ? (
                        <div className="text-xs text-red-500">
                          {managerError}
                        </div>
                      ) : (
                        <select
                          name="manager_id"
                          value={values.manager_id ?? ""}
                          onChange={(e) => setFieldValue( "manager_id", e.target.value
                                ? Number(e.target.value)
                                : undefined,
                            )
                          }
                          className={fieldClass(false)}
                        >
                          <option value="">
                            {t("employees.selectManager")}
                          </option>
                          {managers.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name}
                              {m.department ? ` (${m.department})` : ""}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                  </tr>
                )}

                {/* Employment Type */}
                <tr className="border-b border-slate-200">
                  <td className="px-2 py-1.5 text-sm font-medium text-slate-700">
                    Employment Type
                  </td>
                  <td className="px-2 py-1">
                    <Field
                      as="select"
                      name="employment_type"
                      className={fieldClass(
                        !!(errors.employment_type && touched.employment_type),
                      )}
                    >
                      <option value="full_time">Full-Time</option>
                      <option value="part_time">Part-Time</option>
                      <option value="contract">Contract</option>
                      <option value="intern">Intern</option>
                    </Field>
                    <ErrorMessage
                      name="employment_type"
                      component="p"
                      className="mt-1 text-xs text-red-500"
                    />
                  </td>
                </tr>

                {/* Office / Branch */}
                <tr className="border-b border-slate-200">
                  <td className="px-2 py-1.5 text-sm font-medium text-slate-700">
                    Office / Branch <span className="text-red-500">*</span>
                  </td>
                  <td className="px-2 py-1">
                    <Field
                      type="text"
                      name="office_branch"
                      className={fieldClass(
                        !!(errors.office_branch && touched.office_branch),
                      )}
                      placeholder="e.g. HQ Office / Samora Branch"
                    />
                    <ErrorMessage
                      name="office_branch"
                      component="p"
                      className="mt-1 text-xs text-red-500"
                    />
                  </td>
                </tr>

                {/* Status */}
                <tr>
                  <td className="px-2 py-1.5 text-sm font-medium text-slate-700">
                    Status
                  </td>
                  <td className="px-2 py-1">
                    <Field
                      as="select"
                      name="status"
                      className={fieldClass(false)}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </Field>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default EmployeeFormSection;
