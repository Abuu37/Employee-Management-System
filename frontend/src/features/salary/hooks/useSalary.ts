import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  getAllSalaries,
  getSalaryStats,
  type SalaryRecord,
} from "../services/salary.service";

interface SalaryStats {
  total: number;
  avgBase: number;
  totalGross: number;
  totalNet: number;
}

export function useSalary() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [data, setData] = useState<SalaryRecord[]>([]);
  const [stats, setStats] = useState<SalaryStats>({
    total: 0,
    avgBase: 0,
    totalGross: 0,
    totalNet: 0,
  });
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [sortBy, setSortBy] = useState(
    searchParams.get("sortBy") ?? "created_at",
  );
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">(
    (searchParams.get("sortOrder") as "ASC" | "DESC") ?? "DESC",
  );

  // Sync URL params
  useEffect(() => {
    const params: Record<string, string> = { sortBy, sortOrder };
    if (search) params.search = search;
    setSearchParams(params, { replace: true });
  }, [sortBy, sortOrder, search]);

  // Fetch salary data with sorting and search
  const fetchData = useCallback(async () => {
    try {
      const salaries = await getAllSalaries({ sortBy, sortOrder });
      setData(salaries);
    } catch {
      toast.error("Failed to load salary records");
    }
  }, [sortBy, sortOrder]);

  // Fetch salary stats
  const fetchStats = useCallback(async () => {
    try {
      const s = await getSalaryStats();
      setStats(s);
    } catch {
      // non-critical
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchStats();
  }, [fetchData, fetchStats]);

  //=============== Handle sorting when column header is clicked ==================
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === "ASC" ? "DESC" : "ASC"));
    } else {
      setSortBy(column);
      setSortOrder("DESC");
    }
  };

  //=============== Filter data based on search query ==================
  const filteredData = data.filter((r) => {
    const name = r.user?.name?.toLowerCase() ?? "";
    const email = r.user?.email?.toLowerCase() ?? "";
    const q = search.toLowerCase();
    return name.includes(q) || email.includes(q);
  });

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
