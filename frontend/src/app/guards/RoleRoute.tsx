import { Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import { useUser } from "@/context/UserContext";

type Role = "admin" | "manager" | "employee";

export default function RoleRoute({
  allowedRoles,
  children,
}: {
  allowedRoles: Role[];
  children: JSX.Element;
}) {
  const { user, loading } = useUser();

  if (loading) return null;

  return (
    <ProtectedRoute>
      {user && allowedRoles.includes(user.role) ? (
        children
      ) : (
        <Navigate to="/dashboard" replace />
      )}
    </ProtectedRoute>
  );
}
