import axios from "axios";
import { getAccessToken } from "@/features/auth/services/authSession";

const token = () => getAccessToken();

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${token() ?? ""}` },
});

interface FetchParams {
  sortBy?: string;
  sortOrder?: string;
  status?: string;
}

// Admin: get all payroll records
export const getAllPayroll = async (params?: FetchParams) => {
  const res = await axios.get("/api/payroll", { ...authHeaders(), params });
  return res.data.payrolls;
};

// Manager: get payroll records of team members
export const getTeamPayroll = async (params?: FetchParams) => {
  const res = await axios.get("/api/payroll/team", {
    ...authHeaders(),
    params,
  });
  return res.data.payrolls;
};

// Employee/Manager: get own payroll records (payslip)
export const getMyPayslips = async (params?: FetchParams) => {
  const res = await axios.get("/api/payroll/me", { ...authHeaders(), params });
  return res.data.payrolls;
};

// Admin: generate payroll for a user
export const generatePayroll = async (data: {
  user_id: number;
  month: number;
  year: number;
}) => {
  const res = await axios.post("/api/payroll/generate", data, authHeaders());
  return res.data;
};

// Admin/Manager: approve payroll
export const approvePayroll = async (id: number) => {
  const res = await axios.put(`/api/payroll/${id}/approve`, {}, authHeaders());
  return res.data;
};

// Admin: mark payroll as paid
export const markAsPaid = async (id: number) => {
  const res = await axios.put(`/api/payroll/${id}/pay`, {}, authHeaders());
  return res.data;
};

// Payroll stats (role-aware)
export const getPayrollStats = async (): Promise<{
  total: number;
  pending: number;
  approved: number;
  paid: number;
}> => {
  const res = await axios.get("/api/payroll/stats", authHeaders());
  return res.data;
};
