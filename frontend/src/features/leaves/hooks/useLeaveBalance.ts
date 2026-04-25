import { useState, useEffect } from "react";
import axios from "axios";

export interface LeaveBalance {
  annual: number;
  sick: number;
  casual: number;
  annualTotal: number;
  sickTotal: number;
  casualTotal: number;
}

export default function useLeaveBalance() {
  const [balance, setBalance] = useState<LeaveBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function fetchBalance() {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get("/api/leaves/leave-balance", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = res.data.balance;
        setBalance({
          annual: data.annual,
          sick: data.sick,
          casual: data.casual,
          annualTotal: 20,
          sickTotal: 10,
          casualTotal: 5,
        });
      } catch (err: any) {
        setError(
          err.response?.data?.message || "Failed to fetch leave balance",
        );
      }
      setLoading(false);
    }
    fetchBalance();
  }, []);

  return { balance, loading, error };
}
