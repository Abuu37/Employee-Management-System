import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

export type CurrentUser = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "manager" | "employee";
};

type UserContextValue = {
  user: CurrentUser | null;
  loading: boolean;
  refetch: () => void;
};

const UserContext = createContext<UserContextValue>({
  user: null,
  loading: true,
  refetch: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    axios
      .get("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        const u = res.data;
        setUser(u);
        // keep localStorage in sync so legacy code across the app works
        localStorage.setItem("user-role", u.role);
        localStorage.setItem("user-name", u.name);
        localStorage.setItem("user-email", u.email);
        localStorage.setItem("user-id", String(u.id));
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, refetch: fetchUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
