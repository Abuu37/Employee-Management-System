import { useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";

import { leaveReportService } from "@/features/Report/services/leaveReport.service";
import { useTableQueryParams } from "@/hooks/useTableQueryParams";

import type {
  LeaveCardStats,
  LeaveDetailRecord,
  LeaveReportFilters,
  LeaveSummaryRecord,
  LeaveTrendRecord,
  Pagination,
} from "@/features/Report/types/leaveReport.types";

const DEFAULT_FILTERS: LeaveReportFilters = {
  dateFrom: "",
  dateTo: "",
  userId: "",
  departmentId: "",
  type: "",
  status: "",
  search: "",
};

// Initial empty stats for the summary cards
const EMPTY_CARD_STATS: LeaveCardStats = {
  totalRequests: 0,
  totalApproved: 0,
  totalPending: 0,
  totalRejected: 0,
  approvedDays: 0,
};

// For details pagination
const LIMIT = 10;
const EXPORT_LIMIT = 100;


const TYPE_LABEL: Record<string, string> = {
  annual: "Annual",
  sick: "Sick",
  casual: "Casual",
  emergency: "Emergency",
  unpaid: "Unpaid",
};

// Status labels for display in table and exports
const STATUS_LABEL: Record<string, string> = {
  pending_manager: "Pending Manager",
  pending_hr: "Pending HR",
  approved: "Approved",
  rejected_by_manager: "Rejected Manager",
  rejected_by_hr: "Rejected HR",
};

export function useLeaveReport() {
  const {
    searchParams,
    page,
    search,
    status,
    type,
    setPage,
    updateParams,
    reset: resetQueryParams,
  } = useTableQueryParams({
    defaultSearch: "",
    defaultStatus: "",
    defaultType: "",
    defaultSortBy: "createdAt",
    defaultSortOrder: "DESC",
  });

  // Memoize the applied filters object to avoid unnecessary re-renders and effect triggers
  const appliedFilters = useMemo<LeaveReportFilters>(
    () => ({
      search,
      status,
      type,
      dateFrom: searchParams.get("dateFrom") ?? "",
      dateTo: searchParams.get("dateTo") ?? "",
      userId: searchParams.get("userId") ?? "",
      departmentId: searchParams.get("departmentId") ?? "",
    }),
    [search, status, type, searchParams],
  );

  const [filters, setFilters] = useState<LeaveReportFilters>(appliedFilters);
  const [cardStats, setCardStats] = useState<LeaveCardStats>(EMPTY_CARD_STATS);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [loadingTrends, setLoadingTrends] = useState(true);
  const [detailRows, setDetailRows] = useState<LeaveDetailRecord[]>([]);
  const [trendRows, setTrendRows] = useState<LeaveTrendRecord[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: LIMIT,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false); // to track export state

  useEffect(() => {
    setFilters(appliedFilters);
  }, [appliedFilters]);

  //computed card 
  const computeCardStats = (rows: LeaveSummaryRecord[]): LeaveCardStats =>
    rows.reduce(
      (acc, row) => {
        acc.totalRequests += Number(row.total_leaves) || 0;
        acc.totalApproved += Number(row.approved) || 0;
        acc.totalPending += Number(row.pending) || 0;
        acc.totalRejected += Number(row.rejected) || 0;
        acc.approvedDays += Number(row.approved_days) || 0;
        return acc;
      },
      { ...EMPTY_CARD_STATS },
    );

  useEffect(() => {
    let active = true;

    // SUMMARY
    const fetchSummary = async () => {
      setLoadingSummary(true);
      try {
        const res = await leaveReportService.getSummary(appliedFilters);
        if (!active) return;
        setCardStats(computeCardStats(res.data ?? []));
        setError(null);
      } catch (error) {
        console.error("[LeaveReport:Summary]", error);
        if (!active) return;
        setCardStats(EMPTY_CARD_STATS);
        setError("Failed to load leave summary");
      } finally {
        if (active) setLoadingSummary(false);
      }
    };

    fetchSummary();

    return () => {
      active = false;
    };
  }, [appliedFilters]);

  useEffect(() => {
    let active = true;

    const fetchDetails = async () => {
      setLoadingDetails(true);
      try {
        const res = await leaveReportService.getDetails(
          appliedFilters,
          page,
          LIMIT,
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
      } catch (error) {
        console.error("[LeaveReport:Details]", error);
        if (!active) return;
        setDetailRows([]);
        setError("Failed to load leave records");
      } finally {
        if (active) setLoadingDetails(false);
      }
    };

    fetchDetails();

    return () => {
      active = false;
    };
  }, [appliedFilters, page]);

  useEffect(() => {
    let active = true;

    // TRENDS
    const fetchTrends = async () => {
      setLoadingTrends(true);
      try {
        const res = await leaveReportService.getTrends(appliedFilters);
        if (!active) return;
        setTrendRows(res.data ?? []);
        setError(null);
      } catch (error) {
        console.error("[LeaveReport:Trends]", error);
        if (!active) return;
        setTrendRows([]);
        setError("Failed to load leave trends");
      } finally {
        if (active) setLoadingTrends(false);
      }
    };

    fetchTrends();

    return () => {
      active = false;
    };
  }, [appliedFilters]);

  // DETAILS
  const applyFilters = () => {
    updateParams({
      search: filters.search || null,
      status: filters.status || null,
      type: filters.type || null,
      dateFrom: filters.dateFrom || null,
      dateTo: filters.dateTo || null,
      userId: filters.userId || null,
      departmentId: filters.departmentId || null,
      page: "1",
    });
  };

  // Reset filters to default and clear query params
  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    resetQueryParams();
  };

  // Update page number for pagination, which will trigger details refetch with new page
  const goToPage = (p: number) => setPage(p);

  // EXPORT
  const saveBlob = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  // Escape CSV values, wrapping in quotes if they contain special characters
  const csvEscape = (value: unknown) => {
    if (value == null) return "";
    const s = String(value);
    if (/[",\n]/.test(s)) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  // Fetch all rows for export, handling pagination
  const fetchAllExportRows = async () => {
    const first = await leaveReportService.getDetails(
      appliedFilters,
      1,
      EXPORT_LIMIT,
    );
    const totalPages = first.pagination?.totalPages ?? 1;
    const allRows: LeaveDetailRecord[] = [...(first.data ?? [])];

    for (let p = 2; p <= totalPages; p += 1) {
      const pageRes = await leaveReportService.getDetails(
        appliedFilters,
        p,
        EXPORT_LIMIT,
      );
      allRows.push(...(pageRes.data ?? []));
    }

    return allRows;
  };

  // Export details as CSV
  const exportCsv = async () => {
    try {
      setExporting(true);

      const rows = await fetchAllExportRows();
      const headers = [
        "Employee Name",
        "Employee Email",
        "Employee ID",
        "Department",
        "Leave Type",
        "From Date",
        "To Date",
        "Days",
        "Status",
        "Backup Employee",
      ];

      const body = rows.map((row) => {
        const dept = row.user?.dept?.name ?? "";
        const type = TYPE_LABEL[row.type] ?? row.type;
        const status = STATUS_LABEL[row.overallStatus] ?? row.overallStatus;

        return [
          row.user?.name ?? "",
          row.user?.email ?? "",
          row.user?.employee_id ?? "",
          dept,
          type,
          row.startDate ?? "",
          row.endDate ?? "",
          row.days ?? 0,
          status,
          row.backupEmployee?.name ?? "",
        ]
          .map(csvEscape)
          .join(",");
      });

      const csv = [headers.join(","), ...body].join("\n");
      const blob = new Blob([`\uFEFF${csv}`], {
        type: "text/csv;charset=utf-8;",
      });
      const stamp = new Date().toISOString().slice(0, 10);
      saveBlob(blob, `leave-report-${stamp}.csv`);
    } catch (e) {
      console.error("[LeaveReport:ExportCsv]", e);
      setError("Failed to export CSV");
    } finally {
      setExporting(false);
    }
  };

  // Export details as PDF
  const exportPdf = async () => {
    try {
      setExporting(true);

      const rows = await fetchAllExportRows();
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "pt",
        format: "a4",
      });
      const left = 40;
      const lineHeight = 16;
      let y = 50;

      doc.setFontSize(14);
      doc.text("Leave Report", left, y);
      y += 24;

      doc.setFontSize(9);
      const headers = [
        "Employee",
        "ID",
        "Type",
        "From",
        "To",
        "Days",
        "Status",
      ];
      const colX = [left, 210, 290, 360, 430, 500, 550];

      headers.forEach((h, i) => doc.text(h, colX[i], y));
      y += 10;
      doc.line(left, y, 790, y);
      y += 14;

      rows.forEach((row) => {
        if (y > 560) {
          doc.addPage();
          y = 50;
        }

        const status = STATUS_LABEL[row.overallStatus] ?? row.overallStatus;
        const type = TYPE_LABEL[row.type] ?? row.type;
        const employee = row.user?.name ?? "-";

        doc.text(employee.slice(0, 26), colX[0], y);
        doc.text((row.user?.employee_id ?? "-").slice(0, 14), colX[1], y);
        doc.text(type, colX[2], y);
        doc.text(row.startDate ?? "-", colX[3], y);
        doc.text(row.endDate ?? "-", colX[4], y);
        doc.text(String(row.days ?? 0), colX[5], y);
        doc.text(status.slice(0, 18), colX[6], y);
        y += lineHeight;
      });

      const stamp = new Date().toISOString().slice(0, 10);
      doc.save(`leave-report-${stamp}.pdf`);
    } catch (e) {
      console.error("[LeaveReport:ExportPdf]", e);
      setError("Failed to export PDF");
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
    applyFilters,
    resetFilters,
    goToPage,
    exportCsv,
    exportPdf,
  };
}
