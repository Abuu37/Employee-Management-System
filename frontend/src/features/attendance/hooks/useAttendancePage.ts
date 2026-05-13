import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useUser } from "@/context/UserContext";
import { useTableQueryParams } from "@/Hook/useTableQueryParams";
import { attendanceService } from "@/features/attendance/services/attendance.service";
import type {
  AttendanceRecord,
  AttendanceStats,
} from "@/features/attendance/types/attendance.types";

export const useAttendancePage = () => {
  const { t } = useTranslation();
  const { user } = useUser();
  const role = (user?.role ?? "") as "admin" | "manager" | "employee";

  const {
    searchParams,
    page,
    search,
    status: statusFilter,
    sortBy,
    sortOrder,
    setPage,
    setSearch,
    setStatus: setStatusFilter,
    handleSort,
    setParam,
    updateParams,
  } = useTableQueryParams({ defaultSortBy: "date", defaultSortOrder: "DESC" });

  const dateFrom = searchParams.get("dateFrom") ?? "";
  const dateTo = searchParams.get("dateTo") ?? "";

  const setDateFrom = (v: string) =>
    updateParams({ dateFrom: v || null, page: "1" });
  const setDateTo = (v: string) =>
    updateParams({ dateTo: v || null, page: "1" });

  const viewId = searchParams.get("view")
    ? Number(searchParams.get("view"))
    : null;
  const openView = (id: number) => setParam("view", String(id));
  const closeView = () => setParam("view", null);

  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [showCheckOutModel, setShowCheckOutModel] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const data = await attendanceService.getStats();
      setStats(data);
    } catch {
      // stats remain null; locally-computed fallbacks will be used
    }
  }, []);

  const fetchRecords = useCallback(async () => {
    if (!role) return;
    try {
      setLoading(true);
      const result = await attendanceService.getRecords(role, {
        search,
        status: statusFilter,
        dateFrom,
        dateTo,
        page,
        limit: 10,
        sortBy,
        sortOrder,
      });
      if (Array.isArray(result)) {
        setRecords(result);
        setTotalPages(1);
      } else {
        setRecords(result.data);
        setPage(result.page);
        setTotalPages(result.totalPages);
      }
    } catch {
      toast.error("Failed to load attendance");
      setError("Failed to load attendance");
    } finally {
      setLoading(false);
    }
  }, [role, search, statusFilter, dateFrom, dateTo, page, sortBy, sortOrder]);

  useEffect(() => {
    void fetchRecords();
  }, [fetchRecords]);
  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  const handleCheckIn = async () => {
    setActionLoading(true);
    setActionMsg("");
    try {
      await attendanceService.checkIn();
      const msg = t("attendance.checkedIn");
      setActionMsg(msg);
      toast.success(msg);
      void fetchRecords();
      void fetchStats();
    } catch (err: any) {
      const msg = err.response?.data?.message ?? t("attendance.checkInFailed");
      setActionMsg(msg);
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async (
    completedTaskIds: number[],
    summary: string,
    notes: string,
  ) => {
    setActionLoading(true);
    setActionMsg("");
    try {
      await attendanceService.checkOut({
        work_summary: summary,
        notes,
        completed_task_ids: completedTaskIds,
      });
      const msg = t("attendance.checkedOut");
      setActionMsg(msg);
      toast.success(msg);
      setShowCheckOutModel(false);
      void fetchRecords();
      void fetchStats();
    } catch (err: any) {
      const msg = err.response?.data?.message ?? t("attendance.checkOutFailed");
      setActionMsg(msg);
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  return {
    role,
    t,
    // records
    records,
    loading,
    error,
    totalPages,
    // stats
    stats,
    // filters
    search,
    statusFilter,
    dateFrom,
    dateTo,
    sortBy,
    sortOrder,
    page,
    setPage,
    setSearch,
    setStatusFilter,
    setDateFrom,
    setDateTo,
    setSort: handleSort,
    // employee search
    employeeSearch,
    setEmployeeSearch,
    // view drawer
    viewId,
    openView,
    closeView,
    // check-in/out
    actionLoading,
    actionMsg,
    showCheckOutModel,
    setShowCheckOutModel,
    handleCheckIn,
    handleCheckOut,
  };
};
