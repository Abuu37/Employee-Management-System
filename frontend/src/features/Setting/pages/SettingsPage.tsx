import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  MdLock,
  MdLockOutline,
  MdVisibility,
  MdVisibilityOff,
  MdCheckCircle,
  MdError,
  MdSecurity,
  MdArrowForward,
  MdExpandMore,
} from "react-icons/md";
import Header from "@/layouts/Header";
import Sidebar from "@/layouts/Sidebar";
import {
  clearAuthSession,
  getAccessToken,
} from "@/features/auth/services/authSession";

function PasswordField({
  label,
  placeholder,
  value,
  onChange,
  icon,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  icon: React.ReactNode;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium tracking-wide text-slate-500 uppercase">
        {label}
      </label>
      <div className="relative flex items-center">
        <span className="pointer-events-none absolute left-3 text-slate-400">
          {icon}
        </span>
        <input
          type={show ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pr-11 pl-10 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 text-slate-400 transition hover:text-slate-600"
          tabIndex={-1}
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
        </button>
      </div>
    </div>
  );
}

function Settings() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [openSection, setOpenSection] = useState<string>("changePassword");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const toggle = (key: string) =>
    setOpenSection((prev) => (prev === key ? "" : key));

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all password fields.");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    try {
      setIsSaving(true);

      const token = getAccessToken();
      if (!token) {
        navigate("/login");
        return;
      }

      await axios.put(
        "http://localhost:5000/api/user/change-password",
        {
          currentPassword,
          newPassword,
          confirmPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess("Password changed successfully.");
      toast.success("Password changed successfully");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;

        if (status === 401) {
          clearAuthSession();
          navigate("/login");
          return;
        }

        setError(err.response?.data?.message || "Failed to change password.");
        toast.error(
          err.response?.data?.message || "Failed to change password.",
        );
      } else {
        setError("Failed to change password.");
        toast.error("Failed to change password.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-auto">
        <Header searchTerm={searchTerm} onSearchChange={setSearchTerm} />

        <div className="p-6">
          <div className="mx-auto mt-2 max-w-2xl">
            {/* Accordion sections */}
            <div className="flex flex-col gap-3">
              {/* ── Change Password ── */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {/* Section header (clickable) */}
                <button
                  type="button"
                  onClick={() => toggle("changePassword")}
                  className="flex w-full items-center gap-4 px-6 py-4 text-left transition hover:bg-slate-50"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <MdSecurity size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-800">
                      {t("settings.changePassword")}
                    </p>
                    <p className="text-xs text-slate-500">
                      {t("settings.changePasswordSubtitle")}
                    </p>
                  </div>
                  <MdExpandMore
                    size={22}
                    className={`text-slate-400 transition-transform duration-200 ${
                      openSection === "changePassword" ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Collapsible body */}
                {openSection === "changePassword" && (
                  <div className="border-t border-slate-100 px-6 pb-6 pt-5">
                    {error && (
                      <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                        <MdError size={18} className="mt-0.5 shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}
                    {success && (
                      <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                        <MdCheckCircle size={18} className="mt-0.5 shrink-0" />
                        <span>{success}</span>
                      </div>
                    )}

                    <form
                      className="flex flex-col gap-4"
                      onSubmit={handleChangePassword}
                    >
                      <PasswordField
                        label={t("settings.currentPassword")}
                        placeholder={t("settings.currentPasswordPlaceholder")}
                        value={currentPassword}
                        onChange={setCurrentPassword}
                        icon={<MdLockOutline size={18} />}
                      />
                      <PasswordField
                        label={t("settings.newPassword")}
                        placeholder={t("settings.newPasswordPlaceholder")}
                        value={newPassword}
                        onChange={setNewPassword}
                        icon={<MdLock size={18} />}
                      />
                      <PasswordField
                        label={t("settings.confirmNewPassword")}
                        placeholder={t("settings.confirmPasswordPlaceholder")}
                        value={confirmPassword}
                        onChange={setConfirmPassword}
                        icon={<MdLock size={18} />}
                      />

                      <p className="text-xs text-slate-400">
                        {t("settings.passwordHint")}
                      </p>

                      <button
                        type="submit"
                        disabled={isSaving}
                        className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isSaving ? (
                          t("settings.saving")
                        ) : (
                          <>
                            {t("settings.updatePassword")}
                            <MdArrowForward size={17} />
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Settings;
