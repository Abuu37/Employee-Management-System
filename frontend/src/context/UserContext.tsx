import { createContext, useContext } from "react";

export type CurrentUser = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "manager" | "employee";
  avatar?: string | null;
};

export type UserContextValue = {
  user: CurrentUser | null;
  loading: boolean;
  refetch: () => Promise<void>;
  logout: () => void;
};

export const UserContext = createContext<UserContextValue>({
  user: null,
  loading: true,
  refetch: () => Promise.resolve(),
  logout: () => {},
});

export function useUser() {
  return useContext(UserContext);
}
