import { useState } from "react";
import axios from "axios";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  FiLock,
  FiEye,
  FiEyeOff,
  FiCheckCircle,
  FiArrowLeft,
} from "react-icons/fi";
import toast from "react-hot-toast";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<{
    newPassword?: string;
    confirmPassword?: string;
    general?: string;
  }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (newPassword.length < 6)
      e.newPassword = "Password must be at least 6 characters.";
    if (newPassword !== confirmPassword)
      e.confirmPassword = "Passwords do not match.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (!token) {
      setErrors({ general: "Invalid or missing reset token." });
      return;
    }

    setLoading(true);
    try {
      await axios.post("/api/auth/reset-password", {
        token,
        newPassword,
        confirmPassword,
      });
      setDone(true);
      toast.success("Password reset successfully!");
      setTimeout(() => navigate("/login"), 2500);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Something went wrong.";
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-sm w-full">
          <p className="text-red-500 font-medium mb-4">
            Invalid or missing reset link.
          </p>
          <Link
            to="/forgot-password"
            className="text-indigo-600 hover:underline text-sm"
          >
            Request a new one
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50">
              <FiLock className="h-8 w-8 text-indigo-600" />
            </div>
          </div>

          {done ? (
            /* ── Success state ── */
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <FiCheckCircle className="h-12 w-12 text-emerald-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">
                Password Updated!
              </h2>
              <p className="text-sm text-slate-500 mb-6">
                Your password has been reset successfully. Redirecting you to
                login…
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
              >
                <FiArrowLeft className="h-4 w-4" /> Go to Login
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-slate-800 text-center mb-1">
                Set New Password
              </h2>
              <p className="text-sm text-slate-500 text-center mb-8">
                Choose a strong password for your account.
              </p>

              {/* General error */}
              {errors.general && (
                <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  <span>⚠</span> {errors.general}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    New Password
                  </label>
                  <div
                    className={`flex items-center border-2 rounded-xl px-3 py-2.5 relative transition-colors ${
                      errors.newPassword
                        ? "border-red-400 bg-red-50"
                        : "border-slate-200 focus-within:border-indigo-400"
                    }`}
                  >
                    <FiLock
                      className={`h-4 w-4 mr-2 flex-shrink-0 ${errors.newPassword ? "text-red-400" : "text-slate-400"}`}
                    />
                    <input
                      type={showNew ? "text" : "password"}
                      required
                      value={newPassword}
                      placeholder="Min. 6 characters"
                      className="w-full outline-none border-none bg-transparent text-sm text-slate-800 placeholder-slate-400"
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setErrors((p) => ({ ...p, newPassword: undefined }));
                      }}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowNew((p) => !p)}
                      className="absolute right-3 text-slate-400 hover:text-slate-700"
                    >
                      {showNew ? (
                        <FiEyeOff className="h-4 w-4" />
                      ) : (
                        <FiEye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="mt-1.5 flex items-center gap-1 text-sm text-red-500">
                      <span>⚠</span> {errors.newPassword}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Confirm Password
                  </label>
                  <div
                    className={`flex items-center border-2 rounded-xl px-3 py-2.5 relative transition-colors ${
                      errors.confirmPassword
                        ? "border-red-400 bg-red-50"
                        : "border-slate-200 focus-within:border-indigo-400"
                    }`}
                  >
                    <FiLock
                      className={`h-4 w-4 mr-2 flex-shrink-0 ${errors.confirmPassword ? "text-red-400" : "text-slate-400"}`}
                    />
                    <input
                      type={showConfirm ? "text" : "password"}
                      required
                      value={confirmPassword}
                      placeholder="Repeat your password"
                      className="w-full outline-none border-none bg-transparent text-sm text-slate-800 placeholder-slate-400"
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setErrors((p) => ({
                          ...p,
                          confirmPassword: undefined,
                        }));
                      }}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowConfirm((p) => !p)}
                      className="absolute right-3 text-slate-400 hover:text-slate-700"
                    >
                      {showConfirm ? (
                        <FiEyeOff className="h-4 w-4" />
                      ) : (
                        <FiEye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1.5 flex items-center gap-1 text-sm text-red-500">
                      <span>⚠</span> {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-colors"
                >
                  {loading ? "Updating..." : "Reset Password"}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
                >
                  <FiArrowLeft className="h-4 w-4" /> Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
