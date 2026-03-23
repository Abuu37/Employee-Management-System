
// This file defines the common shapes used everywhere in the frontend application
export type UserRole = "admin" | "manager" | "employee";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: string;
}

export interface Feedback {
  type: "success" | "error";
  message: string;
}
