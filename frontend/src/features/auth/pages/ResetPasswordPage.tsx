import { Link } from "react-router-dom";
import {
  FiLock,
  FiEye,
  FiEyeOff,
  FiCheckCircle,
  FiArrowLeft,
} from "react-icons/fi";
import { useResetPassword } from "@/features/auth/hooks/useAuth";

export default function ResetPasswordPage() {
  const {
    token,
    newPassword,
    confirmPassword,
    showNew,
    showConfirm,
    loading,
    done,
    errors,
    setNewPassword,
    setConfirmPassword,
    setErrors,
    toggleShowNew,
    toggleShowConfirm,
    handleSubmit,
  } = useResetPassword();

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
                      onClick={toggleShowNew}
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
                      onClick={toggleShowConfirm}
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
                  {loading ? "Updating…" : "Reset Password"}
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
