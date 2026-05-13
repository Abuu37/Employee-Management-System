import { FiEye, FiEyeOff } from "react-icons/fi";
import { Link } from "react-router-dom";
import type {
  LoginFormValues,
  LoginFormErrors,
} from "@/features/auth/types/auth.types";

interface LoginFormProps {
  values: LoginFormValues;
  errors: LoginFormErrors;
  showPassword: boolean;
  loading: boolean;
  onTogglePassword: () => void;
  onFieldChange: (name: keyof LoginFormValues, value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export default function LoginForm({
  values,
  errors,
  showPassword,
  loading,
  onTogglePassword,
  onFieldChange,
  onSubmit,
}: LoginFormProps) {
  return (
    <form className="bg-white rounded-md shadow-2xl p-5" onSubmit={onSubmit}>
      <h1 className="text-gray-800 font-bold text-2xl mb-1">Hello Again!</h1>
      <p className="text-sm text-gray-600 mb-8">Welcome Back</p>

      {/* EMAIL */}
      <div className="flex items-center border-2 mb-2 py-2 px-3 rounded-2xl">
        <input
          className="pl-2 w-full outline-none"
          type="email"
          placeholder="Email Address"
          value={values.email}
          onChange={(e) => onFieldChange("email", e.target.value)}
        />
      </div>
      {errors.email && (
        <p className="mb-4 text-sm text-red-600 bg-red-50 px-4 py-2 rounded-xl">
          {errors.email}
        </p>
      )}

      {/* PASSWORD */}
      <div className="flex items-center border-2 mb-2 py-2 px-3 rounded-2xl relative">
        <input
          className="pl-2 w-full outline-none"
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={values.password}
          onChange={(e) => onFieldChange("password", e.target.value)}
        />
        <button
          type="button"
          className="absolute right-3 text-gray-500"
          onClick={onTogglePassword}
        >
          {showPassword ? <FiEyeOff /> : <FiEye />}
        </button>
      </div>
      {errors.password && (
        <p className="mb-4 text-sm text-red-600 bg-red-50 px-4 py-2 rounded-xl">
          {errors.password}
        </p>
      )}

      {/* SUBMIT */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 text-white py-2 rounded-2xl hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
      >
        {loading ? "Signing in…" : "Login"}
      </button>

      {/* FORGOT PASSWORD */}
      <div className="flex justify-between mt-4">
        <Link
          to="/forgot-password"
          className="text-sm text-slate-500 hover:text-indigo-600 hover:-translate-y-1 duration-500 transition-all"
        >
          Forgot Password?
        </Link>
      </div>
    </form>
  );
}
