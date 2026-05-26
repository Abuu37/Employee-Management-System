import { useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";

import { attendanceReportService } from "@/features/Report/services/attendanceReport.service";

import { useTableQueryParams } from "@/hooks/useTableQueryParams";

import type {
  AttendanceDetailRecord,
  AttendanceSummaryRecord,
  AttendanceTrendRecord,
  AttendanceReportFilters,
  AttendanceCardStats,
  Pagination,
} from "@/features/Report/types/attendanceReport.types";

const DEFAULT_FILTERS: AttendanceReportFilters = {
  dateFrom: "",
  dateTo: "",
  userId: "",
  departmentId: "",
  status: "",
  search: "",
};

const EMPTY_CARD_STATS: AttendanceCardStats = {
  totalPresent: 0,
  totalAbsent: 0,
  totalLate: 0,
  totalHalfDay: 0,
  totalHours: 0,
};

const LIMIT = 10;

export function useAttendanceReport() {
  console.log("useAttendanceReport HOOK RUNNING");

  const {
    searchParams,
    page,
    search,
    status,
    sortBy,
    sortOrder,
    setPage,
    handleSort,
    updateParams,
    reset: resetQueryParams,
  } = useTableQueryParams({
    defaultSearch: "",
    defaultStatus: "",
    defaultSortBy: "date",
    defaultSortOrder: "DESC",
  });

  const appliedFilters =
    useMemo<AttendanceReportFilters>(
      () => ({
        search,
        status,
        dateFrom:
          searchParams.get("dateFrom") ?? "",
        dateTo:
          searchParams.get("dateTo") ?? "",
        userId:
          searchParams.get("userId") ?? "",
        departmentId:
          searchParams.get("departmentId") ??
          "",
      }),
      [search, status, searchParams],
    );

  const [filters, setFilters] =
    useState<AttendanceReportFilters>(
      appliedFilters,
    );

  const [cardStats, setCardStats] =
    useState<AttendanceCardStats>(
      EMPTY_CARD_STATS,
    );

  const [loadingSummary, setLoadingSummary] =
    useState(true);

  const [loadingDetails, setLoadingDetails] =
    useState(true);

  const [loadingTrends, setLoadingTrends] =
    useState(true);

  const [detailRows, setDetailRows] =
    useState<AttendanceDetailRecord[]>([]);

  const [trendRows, setTrendRows] =
    useState<AttendanceTrendRecord[]>([]);

  const [pagination, setPagination] =
    useState<Pagination>({
      total: 0,
      page: 1,
      limit: LIMIT,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    });

  const [error, setError] =
    useState<string | null>(null);

  const [exporting, setExporting] =
    useState(false);

  useEffect(() => {
    setFilters(appliedFilters);
  }, [appliedFilters]);

  const computeCardStats = (
    rows: AttendanceSummaryRecord[],
  ): AttendanceCardStats => {
    return rows.reduce(
      (acc, row) => {
        acc.totalPresent +=
          Number(row.present) || 0;

        acc.totalAbsent +=
          Number(row.absent) || 0;

        acc.totalLate +=
          Number(row.late) || 0;

        acc.totalHalfDay +=
          Number(row.half_day) || 0;

        acc.totalHours +=
          Number(row.total_hours) || 0;

        return acc;
      },
      { ...EMPTY_CARD_STATS },
    );
  };

  // SUMMARY
  useEffect(() => {
    let active = true;

    const fetchSummary = async () => {
      console.log("fetchSummary triggered");

      setLoadingSummary(true);

      try {
        const res = await attendanceReportService.getSummary( appliedFilters,);
        console.log( "SUMMARY API RESPONSE:", res);

        if (!active) return;

        setCardStats( res.stats ?? computeCardStats(res.data ?? []), );

        setError(null);
      } catch (e) {
        console.error(
          "[AttendanceReport:Summary]",
          e,
        );

        if (!active) return;

        setCardStats(EMPTY_CARD_STATS);

        setError(
          "Failed to load summary cards",
        );
      } finally {
        if (active)
          setLoadingSummary(false);
      }
    };

    fetchSummary();

    return () => {
      active = false;
    };
  }, [appliedFilters]);

  // DETAILS
  useEffect(() => {
    let active = true;

    const fetchDetails = async () => {
      console.log("fetchDetails triggered");

      setLoadingDetails(true);

      try {
        const res =
          await attendanceReportService.getDetails(
            appliedFilters,
            page,
            LIMIT,
            sortBy,
            sortOrder,
          );

        console.log(
          "DETAILS API RESPONSE:",
          res,
        );

        if (!active) return;

        setDetailRows(res.data ?? []);

        setPagination(
          res.pagination ?? {
            total: 0,
            page,
            limit: LIMIT,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          },
        );

        setError(null);
      } catch (e) {
        console.error(
          "[AttendanceReport:Details]",
          e,
        );

        if (!active) return;

        setDetailRows([]);

        setError(
          "Failed to load attendance table",
        );
      } finally {
        if (active)
          setLoadingDetails(false);
      }
    };

    fetchDetails();

    return () => {
      active = false;
    };
  }, [
    appliedFilters,
    page,
    sortBy,
    sortOrder,
  ]);

  // TRENDS
  useEffect(() => {
    let active = true;

    const fetchTrends = async () => {
      console.log("fetchTrends triggered");

      setLoadingTrends(true);

      try {
        const res =
          await attendanceReportService.getTrends(
            appliedFilters,
          );

        console.log(
          "TRENDS API RESPONSE:",
          res,
        );

        if (!active) return;

        setTrendRows(res.data ?? []);

        setError(null);
      } catch (e) {
        console.error(
          "[AttendanceReport:Trends]",
          e,
        );

        if (!active) return;

        setTrendRows([]);

        setError(
          "Failed to load attendance trends",
        );
      } finally {
        if (active)
          setLoadingTrends(false);
      }
    };

    fetchTrends();

    return () => {
      active = false;
    };
  }, [appliedFilters]);

  const applyFilters = () => {
    updateParams({
      search: filters.search || null,
      status: filters.status || null,
      dateFrom: filters.dateFrom || null,
      dateTo: filters.dateTo || null,
      userId: filters.userId || null,
      departmentId:
        filters.departmentId || null,
      page: "1",
    });
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);

    resetQueryParams();
  };

  const goToPage = (p: number) =>
    setPage(p);

  const saveBlob = (
    blob: Blob,
    filename: string,
  ) => {
    const url =
      window.URL.createObjectURL(blob);

    const a =
      document.createElement("a");

    a.href = url;
    a.download = filename;

    document.body.appendChild(a);

    a.click();

    a.remove();

    window.URL.revokeObjectURL(url);
  };

  const exportCsv = async () => {
    try {
      setExporting(true);

      const blob =
        await attendanceReportService.exportCsv(
          appliedFilters,
        );

      const stamp = new Date()
        .toISOString()
        .slice(0, 10);

      saveBlob(
        blob,
        `attendance-report-${stamp}.csv`,
      );
    } catch (e) {
      console.error(
        "[AttendanceReport:ExportCsv]",
        e,
      );

      setError("Failed to export CSV");
    } finally {
      setExporting(false);
    }
  };

  return {
    filters,
    setFilters,
    detailRows,
    trendRows,
    cardStats,
    pagination,
    loadingSummary,
    loadingDetails,
    loadingTrends,
    exporting,
    error,
    page,
    sortBy,
    sortOrder,
    handleSort,
    applyFilters,
    resetFilters,
    goToPage,
    exportCsv,
  };
}