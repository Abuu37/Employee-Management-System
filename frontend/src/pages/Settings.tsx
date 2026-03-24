import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  MdLock,
  MdLockOutline,
  MdVisibility,
  MdVisibilityOff,
  MdCheckCircle,
  MdError,
  MdSecurity,
  MdArrowForward,
} from "react-icons/md";
import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

      const token = localStorage.getItem("token");
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
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;

        if (status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user-role");
          navigate("/login");
          return;
        }

        setError(err.response?.data?.message || "Failed to change password.");
      } else {
        setError("Failed to change password.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-6">
        <Header searchTerm={searchTerm} onSearchChange={setSearchTerm} />

        <div className="mx-auto mt-2 max-w-lg">
          {/* Card */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* Coloured accent bar */}
            <div className="h-1.5 bg-linear-to-r from-blue-500 to-indigo-500" />

            {/* Card body */}
            <div className="p-7">
              {/* Header row */}
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <MdSecurity size={26} />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    Change Password
                  </h2>
                  <p className="mt-0.5 text-sm text-slate-500">
                    Replace your temporary email password with a secure one.
                  </p>
                </div>
              </div>

              {/* Divider */}
              <hr className="my-6 border-slate-100" />

              {/* Alert banners */}
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

              {/* Form */}
              <form
                className="flex flex-col gap-4"
                onSubmit={handleChangePassword}
              >
                <PasswordField
                  label="Current Password"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={setCurrentPassword}
                  icon={<MdLockOutline size={18} />}
                />

                <PasswordField
                  label="New Password"
                  placeholder="At least 8 characters"
                  value={newPassword}
                  onChange={setNewPassword}
                  icon={<MdLock size={18} />}
                />

                <PasswordField
                  label="Confirm New Password"
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  icon={<MdLock size={18} />}
                />

                <p className="text-xs text-slate-400">
                  Use at least 8 characters with a mix of letters and numbers.
                </p>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving ? (
                    "Saving…"
                  ) : (
                    <>
                      Update Password
                      <MdArrowForward size={17} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Settings;
