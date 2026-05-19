import { useEffect, useState } from "react";
import axios from "axios";
import i18n from "@/i18n";
import type { LangCode } from "@/i18n";
import { authService } from "@/features/auth/services/auth.service";
import {
  clearAuthSession,
  clearLegacyAuthKeys,
  getAccessToken,
} from "@/features/auth/services/authSession";
import { UserContext } from "./UserContext";
import type { CurrentUser } from "./UserContext";

const LANG_KEY = (userId: number) => `ems_language_${userId}`;

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    const token = getAccessToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const userData = res.data;
      setUser(userData);
      const saved = localStorage.getItem(
        LANG_KEY(userData.id),
      ) as LangCode | null;
      i18n.changeLanguage(saved ?? "en");
    } 
    
  catch {
      clearAuthSession();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    void authService.logout().catch(() => {
      // Best-effort server-side session cleanup.
    });
    clearAuthSession();
    setUser(null);
    i18n.changeLanguage("en");
  };

  useEffect(() => {
    clearLegacyAuthKeys();
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, refetch: fetchUser, logout }}>
      {children}
    </UserContext.Provider>
  );
}
