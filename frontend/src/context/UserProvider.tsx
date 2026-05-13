import { useEffect, useState } from "react";
import axios from "axios";
import i18n from "@/i18n";
import type { LangCode } from "@/i18n";
import { UserContext } from "./UserContext";
import type { CurrentUser } from "./UserContext";

const LANG_KEY = (userId: number) => `ems_language_${userId}`;

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
        const saved = localStorage.getItem(
          LANG_KEY(userData.id),
        ) as LangCode | null;
        i18n.changeLanguage(saved ?? "en");
      })
      .catch(() => {
        localStorage.removeItem("token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    i18n.changeLanguage("en");
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
