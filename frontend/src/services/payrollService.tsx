import axios from "axios";

const token = () => localStorage.getItem("token");

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${token()}` },
});

// Admin: get all payroll records
export const getAllPayroll = async () => {
  const res = await axios.get("/api/payroll", authHeaders());
  return res.data.payrolls;
};

// Employee/Manager: get own payroll records (payslip)
export const getMyPayslips = async () => {
  const res = await axios.get("/api/payroll/me", authHeaders());
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
