import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import i18n from "@/i18n";
import type { LangCode } from "@/i18n";

const LANG_KEY = (userId: number) => `ems_language_${userId}`;

export type CurrentUser = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "manager" | "employee";
};

type UserContextValue = {
  user: CurrentUser | null;
  loading: boolean;
  refetch: () => Promise<void>;
  logout: () => void;
};

const UserContext = createContext<UserContextValue>({
  user: null,
  loading: true,
  refetch: () => Promise.resolve(),
  logout: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = (): Promise<void> => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return Promise.resolve();
    }
    return axios
      .get("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        const userData = res.data;
        setUser(userData);
        // Apply this user's saved language preference
        const saved = localStorage.getItem(
          LANG_KEY(userData.id),
        ) as LangCode | null;
        i18n.changeLanguage(saved ?? "en");
      })
      .catch(() => {
        // Token invalid/expired — clear it
        localStorage.removeItem("token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    i18n.changeLanguage("en"); // reset to default when user logs out
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, refetch: fetchUser, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
