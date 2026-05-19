import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  getAllPayroll,
  getTeamPayroll,
  getMyPayslips,
  getPayrollStats,
} from "../services/payroll.service";

interface PayrollStats {
  total: number;
  pending: number;
  approved: number;
  paid: number;
}

export function usePayroll(role: string | undefined) {
  const [searchParams, setSearchParams] = useSearchParams();

  const [data, setData] = useState<any[]>([]);
  const [stats, setStats] = useState<PayrollStats>({
    total: 0,
    pending: 0,
    approved: 0,
    paid: 0,
  });
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [sortBy, setSortBy] = useState(
    searchParams.get("sortBy") ?? "created_at",
  );
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">(
    (searchParams.get("sortOrder") as "ASC" | "DESC") ?? "DESC",
  );

  //================ Sync URL params =================================
  useEffect(() => {
    const params: Record<string, string> = { sortBy, sortOrder };
    if (search) params.search = search;
    setSearchParams(params, { replace: true });
  }, [sortBy, sortOrder, search]);

  const fetchData = useCallback(async () => {
    if (!role) return;
    try {
      const params = { sortBy, sortOrder };
      let payroll: any[] = [];
      if (role === "admin") {
        payroll = await getAllPayroll(params);
      } else if (role === "manager") {
        payroll = await getTeamPayroll(params);
      } else {
        payroll = await getMyPayslips(params);
      }
      setData(payroll);
    } catch {
      toast.error("Failed to load payroll records");
    }
  }, [role, sortBy, sortOrder]);

  const fetchStats = useCallback(async () => {
    if (!role) return;
    try {
      const s = await getPayrollStats();
      setStats(s);
    } catch {
      // non-critical
    }
  }, [role]);

  useEffect(() => {
    fetchData();
    fetchStats();
  }, [fetchData, fetchStats]);

  //=============== Handle sorting ==================
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === "ASC" ? "DESC" : "ASC"));
    } else {
      setSortBy(column);
      setSortOrder("DESC");
    }
  };

  const filteredData = data.filter(
    (d) =>
      (d.user?.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      String(d.year).includes(search) ||
      String(d.month).includes(search),
  );

  return {
    data,
    filteredData,
    stats,
    search,
    setSearch,
    sortBy,
    sortOrder,
    handleSort,
    refetch: fetchData,
    refetchStats: fetchStats,
  };
}
