import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Employee from "./pages/Employee";
import Managers from "./pages/Manager";
import Reports from "./pages/Reports";
import Tasks from "./pages/Task";
import Settings from "./pages/Settings";
import Projects from "./pages/projects";
import TaskCommentPage from "./pages/TaskCommentPage";
import Leave from "./pages/Leaves";
import Payslip from "./pages/payslip/MyPayslipPage";
import Payroll from "./pages/payroll/PayrollPage";
import Salary from "./pages/salary/SalaryPage";
import Documents from "./pages/documents/DocumentPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/employee" element={<Employee />} />
        <Route path="/manager" element={<Managers />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/tasks/:id/comments" element={<TaskCommentPage />} />
        <Route path="/leaves" element={<Leave />} />
        <Route path="/salary" element={<Salary />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/pay-slips" element={<Payslip />} />
        <Route path="/payroll" element={<Payroll />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
