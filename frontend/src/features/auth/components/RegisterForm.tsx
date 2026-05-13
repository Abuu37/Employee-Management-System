import { Link } from "react-router-dom";

export default function RegisterForm() {
  return (
    <>
      <h1 className="mb-2 text-2xl font-bold text-slate-900">Register</h1>
      <p className="mb-6 text-sm text-slate-600">
        Registration form page placeholder.
      </p>

      <form className="space-y-4">
        <div>
          <label
            className="mb-1 block text-sm font-medium text-slate-700"
            htmlFor="name"
          >
            Name
          </label>
          <input
            id="name"
            type="text"
            className="w-full rounded border border-slate-300 px-3 py-2"
          />
        </div>

        <div>
          <label
            className="mb-1 block text-sm font-medium text-slate-700"
            htmlFor="email"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            className="w-full rounded border border-slate-300 px-3 py-2"
          />
        </div>

        <div>
          <label
            className="mb-1 block text-sm font-medium text-slate-700"
            htmlFor="password"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            className="w-full rounded border border-slate-300 px-3 py-2"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded bg-blue-600 px-4 py-2 text-white"
        >
          Create Account
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-600">
        Already have an account?{" "}
        <Link to="/login" className="text-blue-600">
          Login
        </Link>
      </p>
    </>
  );
}
