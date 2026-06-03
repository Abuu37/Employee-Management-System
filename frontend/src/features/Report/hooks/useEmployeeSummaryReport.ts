import { useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";

import { employeeSummaryReportService } from "@/features/Report/services/employeeSummaryReport.service";
import { useTableQueryParams } from "@/hooks/useTableQueryParams";

import type {
  EmployeeDepartmentStatsRecord,
  EmployeeSummaryCards,
  EmployeeSummaryData,
  EmployeeSummaryFilters,
  EmployeeListRecord,
  Pagination,
} from "@/features/Report/types/employeeSummaryReport.types";

const DEFAULT_FILTERS: EmployeeSummaryFilters = {
  search: "",
  status: "",
  employmentType: "",
  gender: "",
  role: "",
  departmentId: "",
  joinDateFrom: "",
  joinDateTo: "",
};

const EMPTY_CARDS: EmployeeSummaryCards = {
  totalEmployees: 0,
  activeEmployees: 0,
  inactiveEmployees: 0,
  departmentCount: 0,
  recentJoiners: 0,
};

const EMPTY_SUMMARY: EmployeeSummaryData = {
  total: 0,
  activeCount: 0,
  inactiveCount: 0,
  byStatus: [],
  byGender: [],
  byEmploymentType: [],
  byRole: [],
  byOfficeBranch: [],
  byDepartment: [],
  recentJoined: [],
};

const LIMIT = 10;
const EXPORT_LIMIT = 100;

export function useEmployeeSummaryReport() {
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
    defaultSortBy: "name",
    defaultSortOrder: "ASC",
  });

  const appliedFilters = useMemo<EmployeeSummaryFilters>(
    () => ({
      search,
      status,
      employmentType: searchParams.get("employmentType") ?? "",
      gender: "",
      role: "",
      departmentId: searchParams.get("departmentId") ?? "",
      joinDateFrom: "",
      joinDateTo: "",
    }),
    [search, status, searchParams],
  );

  const [filters, setFilters] =
    useState<EmployeeSummaryFilters>(appliedFilters);
  const [summaryData, setSummaryData] =
    useState<EmployeeSummaryData>(EMPTY_SUMMARY);
  const [departmentRows, setDepartmentRows] = useState<
    EmployeeDepartmentStatsRecord[]
  >([]);
  const [listRows, setListRows] = useState<EmployeeListRecord[]>([]);
  const [cardStats, setCardStats] = useState<EmployeeSummaryCards>(EMPTY_CARDS);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: LIMIT,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });

  useEffect(() => {
    setFilters(appliedFilters);
  }, [appliedFilters]);

  useEffect(() => {
    let active = true;

    const fetchSummary = async () => {
      setLoadingSummary(true);
      try {
        const res =
          await employeeSummaryReportService.getSummary(appliedFilters);
        if (!active) return;
        const data = res.data ?? EMPTY_SUMMARY;
        setSummaryData(data);
        setCardStats({
          totalEmployees: Number(data.total) || 0,
          activeEmployees: Number(data.activeCount) || 0,
          inactiveEmployees: Number(data.inactiveCount) || 0,
          departmentCount: data.byDepartment?.length ?? 0,
          recentJoiners: data.recentJoined?.length ?? 0,
        });
        setError(null);
      } catch (error) {
        console.error("[EmployeeSummaryReport:Summary]", error);
        if (!active) return;
        setSummaryData(EMPTY_SUMMARY);
        setCardStats(EMPTY_CARDS);
        setError("Failed to load employee summary");
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

    const fetchDepartments = async () => {
      setLoadingDepartments(true);
      try {
        const res =
          await employeeSummaryReportService.getDepartmentStats(appliedFilters);
        if (!active) return;
        setDepartmentRows(res.data ?? []);
        setError(null);
      } catch (error) {
        console.error("[EmployeeSummaryReport:Departments]", error);
        if (!active) return;
        setDepartmentRows([]);
        setError("Failed to load department statistics");
      } finally {
        if (active) setLoadingDepartments(false);
      }
    };

    fetchDepartments();

    return () => {
      active = false;
    };
  }, [appliedFilters]);

  useEffect(() => {
    let active = true;

    const fetchList = async () => {
      setLoadingList(true);
      try {
        const res = await employeeSummaryReportService.getList(
          appliedFilters,
          page,
          LIMIT,
          sortBy,
          sortOrder,
        );
        if (!active) return;
        setListRows(res.data ?? []);
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
        console.error("[EmployeeSummaryReport:List]", error);
        if (!active) return;
        setListRows([]);
        setError("Failed to load employee list");
      } finally {
        if (active) setLoadingList(false);
      }
    };

    fetchList();

    return () => {
      active = false;
    };
  }, [appliedFilters, page, sortBy, sortOrder]);

  const saveBlob = (blob: Blob, fileName: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const csvEscape = (value: unknown) => {
    const text = String(value ?? "");
    if (/[",\n]/.test(text)) {
      return `"${text.replaceAll('"', '""')}"`;
    }
    return text;
  };

  const fetchAllExportRows = async () => {
    const rows: EmployeeListRecord[] = [];
    let currentPage = 1;
    let hasNext = true;

    while (hasNext) {
      const response = await employeeSummaryReportService.getList(
        appliedFilters,
        currentPage,
        EXPORT_LIMIT,
        sortBy,
        sortOrder,
      );

      rows.push(...(response.data ?? []));
      hasNext = response.pagination?.hasNext ?? false;
      currentPage += 1;

      if ((response.data?.length ?? 0) === 0) {
        break;
      }
    }
    return rows;
  };
  const exportCsv = async () => {
    try {
      setExporting(true);

      const rows = await fetchAllExportRows();
      const headers = [
        "Employee Name",
        "Email",
        "Employee ID",
        "Department",
        "Role",
        "Employment Type",
        "Status",
        "Join Date",
        "Supervisor",
      ];

      const body = rows.map((row) =>
        [
          row.name,
          row.email,
          row.employee_id ?? "",
          row.dept?.name ?? "",
          row.role ?? "",
          row.employment_type ?? "",
          row.status ?? "",
          row.join_date ?? "",
          row.supervisor?.name ?? "",
        ]
          .map(csvEscape)
          .join(","),
      );

      const csv = [headers.join(","), ...body].join("\n");
      const blob = new Blob([`\uFEFF${csv}`], {
        type: "text/csv;charset=utf-8;",
      });
      const stamp = new Date().toISOString().slice(0, 10);
      saveBlob(blob, `employee-summary-${stamp}.csv`);
    } catch (e) {
      console.error("[EmployeeSummary:ExportCsv]", e);
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
      doc.text("Employee Summary Report", left, y);
      y += 24;

      doc.setFontSize(9);
      const headers = [
        "Name",
        "Email",
        "Dept",
        "Role",
        "Type",
        "Status",
        "Join Date",
      ];
      const colX = [left, 170, 360, 470, 540, 610, 675];

      headers.forEach((header, index) => doc.text(header, colX[index], y));
      y += 10;
      doc.line(left, y, 790, y);
      y += 14;

      rows.forEach((row) => {
        if (y > 560) {
          doc.addPage();
          y = 50;
        }

        doc.text((row.name ?? "-").slice(0, 26), colX[0], y);
        doc.text((row.email ?? "-").slice(0, 28), colX[1], y);
        doc.text((row.dept?.name ?? "-").slice(0, 18), colX[2], y);
        doc.text((row.role ?? "-").slice(0, 12), colX[3], y);
        doc.text((row.employment_type ?? "-").slice(0, 14), colX[4], y);
        doc.text((row.status ?? "-").slice(0, 12), colX[5], y);
        doc.text((row.join_date ?? "-").slice(0, 10), colX[6], y);
        y += lineHeight;
      });

      const stamp = new Date().toISOString().slice(0, 10);
      doc.save(`employee-summary-${stamp}.pdf`);
    } catch (e) {
      console.error("[EmployeeSummary:ExportPdf]", e);
      setError("Failed to export PDF");
    } finally {
      setExporting(false);
    }
  };

  const applyFilters = () => {
    updateParams({
      search: filters.search || null,
      status: filters.status || null,
      employmentType: filters.employmentType || null,
      gender: null,
      role: null,
      departmentId: filters.departmentId || null,
      joinDateFrom: null,
      joinDateTo: null,
      page: "1",
    });
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    resetQueryParams();
  };

  return {
    filters,
    setFilters,
    summaryData,
    departmentRows,
    listRows,
    cardStats,
    pagination,
    loadingSummary,
    loadingDepartments,
    loadingList,
    exporting,
    error,
    sortBy,
    sortOrder,
    handleSort,
    applyFilters,
    resetFilters,
    goToPage: setPage,
    exportCsv,
    exportPdf,
  };
}
