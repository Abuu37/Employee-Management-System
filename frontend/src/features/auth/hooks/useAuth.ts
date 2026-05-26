import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useUser } from "@/context/UserContext";
import { authService } from "@/features/auth/services/auth.service";
import { setAuthFromLoginResponse } from "@/features/auth/services/authSession";
import type {
  LoginFormErrors,
  ResetPasswordErrors,
} from "@/features/auth/types/auth.types";

// ─────────────────────────────────────────────────────────────────────────────
// useLogin
// ─────────────────────────────────────────────────────────────────────────────

export const useLogin = () => {
  const { refetch } = useUser();
  const navigate = useNavigate();

  const [ showPassword, setShowPassword ] = useState(false);
  const [ loading, setLoading ] = useState(false);

  const handleSubmit = async (value: LoginFormValues) => {
    setLoading(true);

    try{
      const data = await authService.login(value);

      if(data.message === "Login successful"){
        setAuthFromLoginResponse(data);
        await refetch();
        toast.success("Login successful! , welcome back.");
        navigate("/dashboard");
      }
    }catch (error: any) {
      const message = error.response?.data?.message || "Something went wrong. Please try again.";
      toast.error(message);
    }
    finally {
      setLoading(false);
    }

  };

  return {
    showPassword,
    loading,
    toggleShowPassword: () => setShowPassword((prev) => !prev),
    handleSubmit,
  };
};


// ─────────────────────────────────────────────────────────────────────────────
// useForgotPassword
// ─────────────────────────────────────────────────────────────────────────────
export const useForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (values: { email: string }) => {
    setLoading(true);

    try{
      await authService.forgotPassword(values.email);
      setSent(true);
      toast.success("Reset link sent successfully");
    }catch (error: any) {
      const message = error.response?.data?.message || 
      "Something went wrong. Please try again.";

      toast.error(message);
    }finally{
      setLoading(false);
    }

  };

  return {
    loading,
    sent,
    handleSubmit,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// useResetPassword
// ─────────────────────────────────────────────────────────────────────────────
export const useResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const handleSubmit = async (values: { password: string; confirmPassword: string }) => {
    setLoading(true);

    try {
      await authService.resetPassword(token, values.password);

      toast.success(
        "Password reset successful! You can now log in with your new password."
      );
      navigate("/login");
    }
    catch (error:any) {
      const message = error.response?.data?.message || "Something went wrong. Please try again.";
      toast.error(message);
    }
    finally {
      setLoading(false);
    }
  };
  return {
    loading,
    handleSubmit,
  };

};

