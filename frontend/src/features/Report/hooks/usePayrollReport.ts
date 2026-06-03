import { useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";

import { payrollReportService } from "@/features/Report/services/payrollReport.service";
import { useTableQueryParams } from "@/hooks/useTableQueryParams";
import { useUser } from "@/context/UserContext";

import type {
  PayrollCardStats,
  PayrollDetailRecord,
  PayrollReportFilters,
  PayrollSummaryRecord,
  PayrollTrendRecord,
  Pagination,
} from "@/features/Report/types/payrollReport.types";

const DEFAULT_FILTERS: PayrollReportFilters = {
  year: "",
  month: "",
  userId: "",
  departmentId: "",
  status: "",
};

const EMPTY_CARD_STATS: PayrollCardStats = {
  totalNetSalary: 0,
  totalBaseSalary: 0,
  totalBonus: 0,
  totalDeductions: 0,
  totalPaid: 0,
};

const LIMIT = 10;
const EXPORT_LIMIT = 100;

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  paid: "Paid",
};

export function usePayrollReport() {
  const { user } = useUser();
  const canViewTrends = user?.role === "admin" || user?.role === "manager";

  const {
    searchParams,
    page,
    status,
    setPage,
    updateParams,
    reset: resetQueryParams,
  } = useTableQueryParams({
    defaultStatus: "",
    defaultSortBy: "createdAt",
    defaultSortOrder: "DESC",
  });

  const appliedFilters = useMemo<PayrollReportFilters>(
    () => ({
      status,
      year: searchParams.get("year") ?? "",
      month: searchParams.get("month") ?? "",
      userId: searchParams.get("userId") ?? "",
      departmentId: searchParams.get("departmentId") ?? "",
    }),
    [status, searchParams],
  );

  const [filters, setFilters] = useState<PayrollReportFilters>(appliedFilters);
  const [cardStats, setCardStats] =
    useState<PayrollCardStats>(EMPTY_CARD_STATS);
  const [summaryRows, setSummaryRows] = useState<PayrollSummaryRecord[]>([]);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [loadingTrends, setLoadingTrends] = useState(canViewTrends);
  const [detailRows, setDetailRows] = useState<PayrollDetailRecord[]>([]);
  const [trendRows, setTrendRows] = useState<PayrollTrendRecord[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: LIMIT,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    setFilters(appliedFilters);
  }, [appliedFilters]);

  const computeCardStats = (rows: PayrollSummaryRecord[]): PayrollCardStats =>
    rows.reduce(
      (acc, row) => {
        acc.totalNetSalary += Number(row.total_net_salary) || 0;
        acc.totalBaseSalary += Number(row.total_base_salary) || 0;
        acc.totalBonus += Number(row.total_bonus) || 0;
        acc.totalDeductions += Number(row.total_deductions) || 0;
        acc.totalPaid += Number(row.total_paid) || 0;
        return acc;
      },
      { ...EMPTY_CARD_STATS },
    );

  useEffect(() => {
    let active = true;

    const fetchSummary = async () => {
      setLoadingSummary(true);
      try {
        const res = await payrollReportService.getSummary(appliedFilters);
        if (!active) return;
        const rows = res.data ?? [];
        setSummaryRows(rows);
        setCardStats(computeCardStats(rows));
        setError(null);
      } catch (error) {
        console.error("[PayrollReport:Summary]", error);
        if (!active) return;
        setSummaryRows([]);
        setCardStats(EMPTY_CARD_STATS);
        setError("Failed to load payroll summary");
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
        const res = await payrollReportService.getDetails(
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
        console.error("[PayrollReport:Details]", error);
        if (!active) return;
        setDetailRows([]);
        setError("Failed to load payroll records");
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
    if (!canViewTrends) {
      setTrendRows([]);
      setLoadingTrends(false);
      return;
    }

    let active = true;

    const fetchTrends = async () => {
      setLoadingTrends(true);
      try {
        const res = await payrollReportService.getTrends(appliedFilters);
        if (!active) return;
        setTrendRows(res.data ?? []);
        setError(null);
      } catch (error) {
        console.error("[PayrollReport:Trends]", error);
        if (!active) return;
        setTrendRows([]);
        setError("Failed to load payroll trends");
      } finally {
        if (active) setLoadingTrends(false);
      }
    };

    fetchTrends();

    return () => {
      active = false;
    };
  }, [appliedFilters, canViewTrends]);

  const applyFilters = () => {
    updateParams({
      status: filters.status || null,
      year: filters.year || null,
      month: filters.month || null,
      userId: filters.userId || null,
      departmentId: filters.departmentId || null,
      page: "1",
    });
  };

  // Reset filters to default values and clear query parameters related to filters and pagination
  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    resetQueryParams();
  };

  // Update the current page in pagination state, which will trigger a refetch of details with the new page number
  const goToPage = (p: number) => setPage(p);

  // Utility function to trigger download of a blob (used for CSV and PDF exports)
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

  const csvEscape = (value: unknown) => {
    if (value == null) return "";
    const s = String(value);
    if (/[",\n]/.test(s)) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const fetchAllExportRows = async () => {
    const first = await payrollReportService.getDetails(
      appliedFilters,
      1,
      EXPORT_LIMIT,
    );
    const totalPages = first.pagination?.totalPages ?? 1;
    const allRows: PayrollDetailRecord[] = [...(first.data ?? [])];

    for (let p = 2; p <= totalPages; p += 1) {
      const pageRes = await payrollReportService.getDetails(
        appliedFilters,
        p,
        EXPORT_LIMIT,
      );
      allRows.push(...(pageRes.data ?? []));
    }

    return allRows;
  };

  const exportCsv = async () => {
    try {
      setExporting(true);
      const rows = await fetchAllExportRows();
      const headers = [
        "Employee Name",
        "Employee Email",
        "Employee ID",
        "Department",
        "Month",
        "Year",
        "Base Salary",
        "Bonus",
        "Allowance",
        "Deductions",
        "Tax",
        "Net Salary",
        "Status",
      ];

      const body = rows.map((row) => {
        return [
          row.user?.name ?? "",
          row.user?.email ?? "",
          row.user?.employee_id ?? "",
          row.user?.dept?.name ?? "",
          row.month,
          row.year,
          row.base_salary,
          row.bonus,
          row.allowance,
          row.deductions,
          row.tax,
          row.net_salary,
          STATUS_LABEL[row.status] ?? row.status,
        ]
          .map(csvEscape)
          .join(",");
      });

      const csv = [headers.join(","), ...body].join("\n");
      const blob = new Blob([`\uFEFF${csv}`], {
        type: "text/csv;charset=utf-8;",
      });
      const stamp = new Date().toISOString().slice(0, 10);
      saveBlob(blob, `payroll-report-${stamp}.csv`);
    } catch (error) {
      console.error("[PayrollReport:ExportCsv]", error);
      setError("Failed to export CSV");
    } finally {
      setExporting(false);
    }
  };

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
      doc.text("Payroll Report", left, y);
      y += 24;

      doc.setFontSize(9);
      const headers = ["Employee", "ID", "Month", "Year", "Net", "Status"];
      const colX = [left, 230, 340, 400, 460, 560];
      headers.forEach((h, i) => doc.text(h, colX[i], y));
      y += 10;
      doc.line(left, y, 790, y);
      y += 14;

      rows.forEach((row) => {
        if (y > 560) {
          doc.addPage();
          y = 50;
        }

        doc.text((row.user?.name ?? "-").slice(0, 30), colX[0], y);
        doc.text((row.user?.employee_id ?? "-").slice(0, 14), colX[1], y);
        doc.text(String(row.month), colX[2], y);
        doc.text(String(row.year), colX[3], y);
        doc.text(String(row.net_salary ?? 0), colX[4], y);
        doc.text(
          (STATUS_LABEL[row.status] ?? row.status).slice(0, 14),
          colX[5],
          y,
        );
        y += lineHeight;
      });

      const stamp = new Date().toISOString().slice(0, 10);
      doc.save(`payroll-report-${stamp}.pdf`);
    } catch (error) {
      console.error("[PayrollReport:ExportPdf]", error);
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
    summaryRows,
    cardStats,
    pagination,
    loadingSummary,
    loadingDetails,
    loadingTrends,
    exporting,
    canViewTrends,
    error,
    applyFilters,
    resetFilters,
    goToPage,
    exportCsv,
    exportPdf,
  };
}
