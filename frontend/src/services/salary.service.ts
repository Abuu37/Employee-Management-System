import axios from "axios";

const token = () => localStorage.getItem("token");

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${token()}` },
});

export interface SalaryPayload {
  user_id: number;
  base_salary: number;
  bonus?: number;
  allowance?: number;
  tax_percentage?: number;
}

export interface SalaryRecord {
  id: number;
  user_id: number;
  base_salary: string;
  bonus: string;
  allowance: string;
  tax_percentage: string;
  user?: { id: number; name: string; email: string; role: string };
}

// Admin: get all salaries
export const getAllSalaries = async (): Promise<SalaryRecord[]> => {
  const res = await axios.get("/api/salary", authHeaders());
  return res.data.salaries;
};

// Admin: set or update salary
export const setSalary = async (data: SalaryPayload) => {
  const res = await axios.post("/api/salary/generate", data, authHeaders());
  return res.data;
};

// Logged-in user: get own salary
export const getMySalary = async (): Promise<SalaryRecord> => {
  const res = await axios.get("/api/salary/me", authHeaders());
  return res.data.salary;
};

// Admin: delete salary
export const deleteSalary = async (id: number) => {
  const res = await axios.delete(`/api/salary/${id}`, authHeaders());
  return res.data;
};
