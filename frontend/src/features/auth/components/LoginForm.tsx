import { FiEye, FiEyeOff } from "react-icons/fi";
import { Link } from "react-router-dom";
import type {
  LoginFormValues,
  LoginFormErrors,
} from "@/features/auth/types/auth.types";

import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

interface LoginFormProps {
  showPassword: boolean;
  loading: boolean;
  onTogglePassword: () => void;
  onSubmit: (values: LoginFormValues) => void;
}

const validationSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),

  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

export default function LoginForm({
  showPassword,
  loading,
  onTogglePassword,
  onSubmit,
}: LoginFormProps) {
  return (
    <Formik
      initialValues={{
        email: "",
        password: "",
      }}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({ errors, touched }) => (
        <Form className="bg-white rounded-md shadow-2xl p-5">
          <h1 className="text-gray-800 font-bold text-2xl mb-1">
            Hello Again!
          </h1>

          <p className="text-sm text-gray-600 mb-8">Welcome Back</p>

          {/* EMAIL */}
          <div
            className={`flex items-center border-2 mb-2 py-2 px-3 rounded-2xl ${
              errors.email && touched.email
                ? "border-red-500"
                : "border-slate-200"
            }`}
          >
            <Field
              name="email"
              type="email"
              placeholder="Email Address"
              className="w-full px-2 py-1.5 text-sm outline-none bg-transparent
              placeholder-gray-400"
            />
          </div>

          <ErrorMessage
            name="email"
            component="div"
            className="mb-4 text-sm text-red-600 px-4 py-2 rounded-xl"
          />

          {/* PASSWORD */}
          <div
            className={`flex items-center border-2 mb-2 py-2 px-3 rounded-2xl relative ${
              errors.password && touched.password
                ? "border-red-500"
                : "border-slate-200"
            }`}
          >
            <Field
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full px-2 py-1.5 text-sm outline-none
               bg-transparent placeholder-gray-400"
            />

            <button
              type="button"
              className="absolute right-3 text-gray-500"
              onClick={onTogglePassword}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          <ErrorMessage
            name="password"
            component="div"
            className="mb-4 text-sm text-red-600 px-4 py-2 rounded-xl"
          />

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-2xl hover:bg-indigo-700
            disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {loading ? "Signing in…" : "Login"}
          </button>

          {/* FORGOT PASSWORD */}
          <div className="flex justify-between mt-4">
            <Link
              to="/forgot-password"
              className="text-sm text-slate-500 hover:text-indigo-600 
              hover:-translate-y-1 duration-500 transition-all"
            >
              Forgot Password?
            </Link>
          </div>
        </Form>
      )}
    </Formik>
  );
}
