import AuthLayout from "@/features/auth/components/AuthLayout";
import LoginForm from "@/features/auth/components/LoginForm";
import { useLogin } from "@/features/auth/hooks/useAuth";

export default function LoginPage() {
  const {
    values,
    errors,
    showPassword,
    loading,
    togglePassword,
    handleFieldChange,
    handleSubmit,
  } = useLogin();

  return (
    <AuthLayout>
      <LoginForm
        values={values}
        errors={errors}
        showPassword={showPassword}
        loading={loading}
        onTogglePassword={togglePassword}
        onFieldChange={handleFieldChange}
        onSubmit={handleSubmit}
      />
    </AuthLayout>
  );
}
