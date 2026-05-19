import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import { getAccessToken } from "@/features/auth/services/authSession";

export default function ProtectedRoute({
  children,
}: {
  children: JSX.Element;
}) {
  const { user, loading } = useUser();
  const location = useLocation();
  const token = getAccessToken();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
