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
      .then((res) => setUser(res.data))
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
