import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useUser } from "@/context/UserContext";
import { authService } from "@/features/auth/services/auth.service";
import { setAuthFromLoginResponse } from "@/features/auth/services/authSession";
import type {
  LoginFormValues,
  LoginFormErrors,
  ResetPasswordErrors,
} from "@/features/auth/types/auth.types";

// ─────────────────────────────────────────────────────────────────────────────
// useLogin
// ─────────────────────────────────────────────────────────────────────────────
const validateLoginField = (name: string, value: string): string => {
  if (name === "email") {
    if (!value) return "Email is required";
    if (!/\S+@\S+\.\S+/.test(value)) return "Email is invalid";
  }
  if (name === "password") {
    if (!value) return "Password is required";
    if (value.length < 6) return "Password must be at least 6 characters";
  }
  return "";
};

export const useLogin = () => {
  const { refetch } = useUser();
  const navigate = useNavigate();

  const [values, setValues] = useState<LoginFormValues>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<LoginFormErrors>({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFieldChange = (name: keyof LoginFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: validateLoginField(name, value) }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const emailError = validateLoginField("email", values.email);
    const passwordError = validateLoginField("password", values.password);
    if (emailError || passwordError) {
      setErrors({ email: emailError, password: passwordError });
      return;
    }

    setLoading(true);
    try {
      const data = await authService.login(values);
      if (data.message === "Login successful") {
        setAuthFromLoginResponse(data);
        await refetch();
        toast.success("Login successful! Welcome back");
        navigate("/dashboard");
      }
    } catch (error: any) {
      const field = error.response?.data?.field;
      const message = error.response?.data?.message || "Something went wrong";
      if (field) {
        setErrors((prev) => ({ ...prev, [field]: message }));
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    values,
    errors,
    showPassword,
    loading,
    togglePassword: () => setShowPassword((p) => !p),
    handleFieldChange,
    handleSubmit,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// useForgotPassword
// ─────────────────────────────────────────────────────────────────────────────
export const useForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch {
      const msg = "Something went wrong. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return { email, loading, sent, error, handleEmailChange, handleSubmit };
};

// ─────────────────────────────────────────────────────────────────────────────
// useResetPassword
// ─────────────────────────────────────────────────────────────────────────────
export const useResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token") ?? "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<ResetPasswordErrors>({});

  const validate = () => {
    const e: ResetPasswordErrors = {};
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
      await authService.resetPassword({ token, newPassword, confirmPassword });
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

  return {
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
    toggleShowNew: () => setShowNew((p) => !p),
    toggleShowConfirm: () => setShowConfirm((p) => !p),
    handleSubmit,
  };
};
