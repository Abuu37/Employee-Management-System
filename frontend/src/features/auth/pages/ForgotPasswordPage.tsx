import { Link } from "react-router-dom";
import { FiMail, FiArrowLeft, FiCheckCircle } from "react-icons/fi";
import { useForgotPassword } from "@/features/auth/hooks/useAuth";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

export default function ForgotPasswordPage() {
  const { loading, sent, error, handleSubmit } = useForgotPassword();

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
  });

  return (
    <Formik
      initialValues={{ email: "" }}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ errors, touched }) => (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50">
                  <FiMail className="h-8 w-8 text-indigo-600" />
                </div>
              </div>

              {sent ? (
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    <FiCheckCircle className="h-12 w-12 text-emerald-500" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800 mb-2">
                    Check your inbox
                  </h2>
                  <p className="text-sm text-slate-500 mb-6">
                    If your email is registered, you'll receive a password reset
                    link shortly.
                  </p>
                  <p className="text-xs text-slate-400 mb-6">
                    Didn't receive it? Check your spam folder or wait a minute
                    and try again.
                  </p>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
                  >
                    <FiArrowLeft className="h-4 w-4" /> Back to Login
                  </Link>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-slate-800 text-center mb-1">
                    Forgot Password?
                  </h2>
                  <p className="text-sm text-slate-500 text-center mb-8">
                    Enter your email and we'll send you a reset link.
                  </p>

                  <Form className="space-y-5">
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-slate-700 mb-1.5"
                      >
                        Email address
                      </label>
                      <div
                        className={`flex items-center border-2 rounded-xl px-3 py-2.5 transition-colors ${
                          errors.email && touched.email
                            ? "border-red-400"
                            : "border-slate-200 focus-within:border-indigo-400"
                        }`}
                      >
                        <FiMail
                          className={`h-4 w-4 mr-2 shrink-0 ${
                            errors.email && touched.email
                              ? "text-red-400"
                              : "text-slate-400"
                          }`}
                        />

                        <Field
                          id="email"
                          name="email"
                          type="email"
                          placeholder="kitofuabubakar@gmail.com"
                          className="w-full outline-none border-none bg-transparent
                      text-sm text-slate-800 placeholder-slate-400"
                        />
                      </div>

                      <ErrorMessage
                        name="email"
                        component="div"
                        className="mt-2 text-sm text-red-600  px-4 py-2 rounded-xl"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-colors"
                    >
                      {loading ? "Sending…" : "Send Reset Link"}
                    </button>
                  </Form>

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
      )}
    </Formik>
  );
}
