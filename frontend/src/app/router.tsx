import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "@/features/auth/LoginPage";
import RegisterPage from "@/features/auth/RegisterPage";
import ForgotPasswordPage from "@/features/auth/ForgotPasswordPage";
import ResetPasswordPage from "@/features/auth/ResetPasswordPage";
import DashboardPage from "@/features/dashboard/DashboardPage";
import EmployeePage from "@/features/employees/EmployeePage";
import ManagerPage from "@/features/employees/ManagerPage";
import Reports from "@/pages/Reports";
import TaskPage from "@/features/tasks/TaskPage";
import Settings from "@/pages/Settings";
import ProjectsPage from "@/features/projects/ProjectsPage";
import TaskCommentPage from "@/features/tasks/TaskCommentPage";
import LeavesPage from "@/features/leaves/LeavesPage";
import MyPayslipPage from "@/features/payslip/MyPayslipPage";
import PayrollPage from "@/features/payroll/PayrollPage";
import SalaryPage from "@/features/salary/SalaryPage";
import DocumentPage from "@/features/documents/DocumentPage";
import AttendancePage from "@/features/attendance/AttendancePage";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/employee" element={<EmployeePage />} />
      <Route path="/manager" element={<ManagerPage />} />
      <Route path="/projects" element={<ProjectsPage />} />
      <Route path="/tasks" element={<TaskPage />} />
      <Route path="/tasks/:id/comments" element={<TaskCommentPage />} />
      <Route path="/leaves" element={<LeavesPage />} />
      <Route path="/salary" element={<SalaryPage />} />
      <Route path="/documents" element={<DocumentPage />} />
      <Route path="/pay-slips" element={<MyPayslipPage />} />
      <Route path="/payroll" element={<PayrollPage />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/reports/attendance" element={<Reports />} />
      <Route path="/reports/leave" element={<Reports />} />
      <Route path="/reports/payroll" element={<Reports />} />
      <Route path="/reports/employee-summary" element={<Reports />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/attendance" element={<AttendancePage />} />
      <Route path="/my-attendance" element={<AttendancePage />} />
    </Routes>
  );
}
