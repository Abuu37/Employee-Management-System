import React, { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import "./Login.css";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [values, setValues] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  // ================= VALIDATION =================
  const validate = (name: string, value: string) => {
    let message = "";

    if (name === "email") {
      if (!value) {
        message = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(value)) {
        message = "Email is invalid";
      }
    }

    if (name === "password") {
      if (!value) {
        message = "Password is required";
      } else if (value.length < 6) {
        message = "Password must be at least 6 characters";
      }
    }

    return message;
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const emailError = validate("email", values.email);
    const passwordError = validate("password", values.password);

    if (emailError || passwordError) {
      setErrors({
        email: emailError,
        password: passwordError,
      });
      return;
    }

    try {
      const result = await axios.post(
        "http://localhost:5000/api/auth/login",
        values,
      );

      if (result.data.message === "Login successful") {
        localStorage.setItem("token", result.data.token);
        localStorage.setItem("user-role", result.data["user-role"]);
        localStorage.setItem("user-name", result.data["user-name"]);
        localStorage.setItem("user-email", result.data["user-email"]);
        localStorage.setItem("user-id", result.data["user-id"]);

        toast.success("Login successful! Welcome back");

        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);
      }
    } catch (error: any) {
      const field = error.response?.data?.field;
      const message = error.response?.data?.message || "Something went wrong";

      if (field) {
        setErrors((prev) => ({
          ...prev,
          [field]: message,
        }));
      } else {
        toast.error(message);
      }
    }
  };

  return (
    <div className="h-screen flex">
      {/* LEFT SIDE */}
      <div className="hidden lg:flex w-full lg:w-1/2 login_img_section justify-around items-center">
        <div className="bg-black opacity-20 inset-0 z-0" />

        <div className="w-full max-w-xl mx-auto px-20 flex-col items-center space-y-6">
          <span className="inline-block rounded-full border border-white/40 bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white">
            Staff Operations Suite
          </span>

          <h1 className="text-white font-extrabold text-4xl xl:text-3xl leading-tight tracking-tight">
            EMS - Employee Management System <br />
            Login
          </h1>

          <p className="max-w-md text-white/90 text-base leading-relaxed">
            One secure place to manage teams, attendance, and daily workforce
            operations.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex w-full lg:w-1/2 justify-center items-center bg-white">
        <div className="w-full px-8 md:px-32 lg:px-24">
          <form
            className="bg-white rounded-md shadow-2xl p-5"
            onSubmit={handleSubmit}
          >
            <h1 className="text-gray-800 font-bold text-2xl mb-1">
              Hello Again!
            </h1>

            <p className="text-sm text-gray-600 mb-8">Welcome Back</p>

            {/* EMAIL */}
            <div className="flex items-center border-2 mb-2 py-2 px-3 rounded-2xl">
              <input
                className="pl-2 w-full outline-none"
                type="email"
                placeholder="Email Address"
                value={values.email}
                onChange={(e) => {
                  const value = e.target.value;

                  setValues({ ...values, email: value });

                  setErrors((prev) => ({
                    ...prev,
                    email: validate("email", value),
                  }));
                }}
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
                onChange={(e) => {
                  const value = e.target.value;

                  setValues({ ...values, password: value });

                  setErrors((prev) => ({
                    ...prev,
                    password: validate("password", value),
                  }));
                }}
              />

              <button
                type="button"
                className="absolute right-3 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            {errors.password && (
              <p className="mb-4 text-sm text-red-600 bg-red-50 px-4 py-2 rounded-xl">
                {errors.password}
              </p>
            )}

            {/* BUTTON */}
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 rounded-2xl hover:bg-indigo-700 transition"
            >
              Login
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
        </div>
      </div>
    </div>
  );
};

export default Login;
