// Auth state store (Context-based, no extra library needed)
// Replace with Zustand or Redux if the app grows.

import { createContext, useContext, useState, ReactNode } from "react";

interface AuthState {
  token: string | null;
  role: string | null;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  setAuth: (data: Omit<AuthState, "setAuth" | "clearAuth">) => void;
  clearAuth: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [role, setRole] = useState<string | null>(localStorage.getItem("user-role"));
  const [userId, setUserId] = useState<string | null>(localStorage.getItem("user-id"));
  const [userName, setUserName] = useState<string | null>(localStorage.getItem("user-name"));
  const [userEmail, setUserEmail] = useState<string | null>(localStorage.getItem("user-email"));

  function setAuth(data: Omit<AuthState, "setAuth" | "clearAuth">) {
    setToken(data.token);
    setRole(data.role);
    setUserId(data.userId);
    setUserName(data.userName);
    setUserEmail(data.userEmail);
  }

  function clearAuth() {
    setToken(null);
    setRole(null);
    setUserId(null);
    setUserName(null);
    setUserEmail(null);
    localStorage.clear();
  }

  return (
    <AuthContext.Provider value={{ token, role, userId, userName, userEmail, setAuth, clearAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
