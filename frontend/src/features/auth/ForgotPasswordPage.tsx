import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FiMail, FiArrowLeft, FiCheckCircle } from "react-icons/fi";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await axios.post("/api/auth/forgot-password", { email });
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50">
              <FiMail className="h-8 w-8 text-indigo-600" />
            </div>
          </div>

          {sent ? (
            /* ── Success state ── */
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <FiCheckCircle className="h-12 w-12 text-emerald-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">
                Check your inbox
              </h2>
              <p className="text-sm text-slate-500 mb-6">
                If <span className="font-medium text-slate-700">{email}</span>{" "}
                is registered, you'll receive a password reset link shortly.
              </p>
              <p className="text-xs text-slate-400 mb-6">
                Didn't receive it? Check your spam folder or wait a minute and
                try again.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
              >
                <FiArrowLeft className="h-4 w-4" /> Back to Login
              </Link>
            </div>
          ) : (
            /* ── Form state ── */
            <>
              <h2 className="text-2xl font-bold text-slate-800 text-center mb-1">
                Forgot Password?
              </h2>
              <p className="text-sm text-slate-500 text-center mb-8">
                Enter your email and we'll send you a reset link.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-slate-700 mb-1.5"
                  >
                    Email address
                  </label>
                  <div
                    className={`flex items-center border-2 rounded-xl px-3 py-2.5 transition-colors ${
                      error
                        ? "border-red-400 bg-red-50"
                        : "border-slate-200 focus-within:border-indigo-400"
                    }`}
                  >
                    <FiMail
                      className={`h-4 w-4 mr-2 flex-shrink-0 ${error ? "text-red-400" : "text-slate-400"}`}
                    />
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      placeholder="you@example.com"
                      className="w-full outline-none border-none bg-transparent text-sm text-slate-800 placeholder-slate-400"
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                      }}
                    />
                  </div>
                  {error && (
                    <p className="mt-1.5 flex items-center gap-1 text-sm text-red-500">
                      <span>⚠</span> {error}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-colors"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
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
