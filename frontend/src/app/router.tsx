import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "@/app/guards/ProtectedRoute";
import RoleRoute from "@/app/guards/RoleRoute";

const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/features/auth/pages/RegisterPage"));
const ForgotPasswordPage = lazy(
  () => import("@/features/auth/pages/ForgotPasswordPage"),
);
const ResetPasswordPage = lazy(
  () => import("@/features/auth/pages/ResetPasswordPage"),
);
const DashboardPage = lazy(
  () => import("@/features/dashboard/pages/DashboardPage"),
);
const Users = lazy(() => import("@/features/users/pages/Users"));
const ManagerPage = lazy(() => import("@/features/users/pages/ManagerPage"));
const Reports = lazy(() => import("@/features/Report/pages/ReportsPage"));
const TaskPage = lazy(() => import("@/features/tasks/pages/Tasks"));
const Settings = lazy(() => import("@/features/Setting/pages/SettingsPage"));
const ProjectsPage = lazy(() => import("@/features/projects/pages/Projects"));
const TaskCommentPage = lazy(
  () => import("@/features/tasks/pages/TaskCommentPage"),
);
const LeavesPage = lazy(() => import("@/features/leaves/pages/LeavesPage"));
const MyPayslipPage = lazy(
  () => import("@/features/payslip/pages/MyPayslipPage"),
);
const PayrollPage = lazy(() => import("@/features/payroll/pages/PayrollPage"));
const SalaryPage = lazy(() => import("@/features/salary/pages/SalaryPage"));
const DocumentPage = lazy(
  () => import("@/features/documents/pages/DocumentPage"),
);
const AttendancePage = lazy(
  () => import("@/features/attendance/pages/AttendancePage"),
);
const DepartmentsPage = lazy(
  () => import("@/features/departments/pages/DepartmentsPage"),
);

const RouteLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-50">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
  </div>
);

export default function AppRouter() {
  return (
    <Suspense fallback={<RouteLoader />}>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employee"
          element={
            <RoleRoute allowedRoles={["admin"]}>
              <Users />
            </RoleRoute>
          }
        />

        <Route
          path="/manager"
          element={
            <RoleRoute allowedRoles={["admin"]}>
              <ManagerPage />
            </RoleRoute>
          }
        />

        <Route
          path="/projects"
          element={
            <RoleRoute allowedRoles={["admin", "manager"]}>
              <ProjectsPage />
            </RoleRoute>
          }
        />

        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <TaskPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tasks/:id/comments"
          element={
            <ProtectedRoute>
              <TaskCommentPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/leaves"
          element={
            <ProtectedRoute>
              <LeavesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/salary"
          element={
            <RoleRoute allowedRoles={["admin"]}>
              <SalaryPage />
            </RoleRoute>
          }
        />

        <Route
          path="/documents"
          element={
            <ProtectedRoute>
              <DocumentPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/pay-slips"
          element={
            <ProtectedRoute>
              <MyPayslipPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/payroll"
          element={
            <RoleRoute allowedRoles={["admin", "manager"]}>
              <PayrollPage />
            </RoleRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <RoleRoute allowedRoles={["admin", "manager"]}>
              <Reports />
            </RoleRoute>
          }
        />
        <Route
          path="/reports/attendance"
          element={
            <RoleRoute allowedRoles={["admin", "manager"]}>
              <Reports />
            </RoleRoute>
          }
        />
        <Route
          path="/reports/leave"
          element={
            <RoleRoute allowedRoles={["admin", "manager"]}>
              <Reports />
            </RoleRoute>
          }
        />
        <Route
          path="/reports/payroll"
          element={
            <RoleRoute allowedRoles={["admin", "manager"]}>
              <Reports />
            </RoleRoute>
          }
        />
        <Route
          path="/reports/employee-summary"
          element={
            <RoleRoute allowedRoles={["admin", "manager"]}>
              <Reports />
            </RoleRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/attendance"
          element={
            <ProtectedRoute>
              <AttendancePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-attendance"
          element={
            <ProtectedRoute>
              <AttendancePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/departments"
          element={
            <RoleRoute allowedRoles={["admin"]}>
              <DepartmentsPage />
            </RoleRoute>
          }
        />
      </Routes>
    </Suspense>
  );
}
