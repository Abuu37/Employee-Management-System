// This file defines the common shapes used everywhere in the frontend application
export type UserRole = "admin" | "manager" | "employee";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: string;
  department?: string;
  manager_id?: number;
}

export interface Feedback {
  type: "success" | "error";
  message: string;
}
