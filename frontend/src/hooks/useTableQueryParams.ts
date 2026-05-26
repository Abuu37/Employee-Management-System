import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

type SortOrder = "ASC" | "DESC";

type Options = {
  defaultPage?: number;
  defaultSearch?: string;
  defaultStatus?: string;
  defaultType?: string;
  defaultSortBy?: string;
  defaultSortOrder?: SortOrder;
  ensurePageParam?: boolean;
};

export function useTableQueryParams(options?: Options) {
  const {
    defaultPage = 1,
    defaultSearch = "",
    defaultStatus = "all",
    defaultType = "all",
    defaultSortBy = "createdAt",
    defaultSortOrder = "DESC",
    ensurePageParam = true,
  } = options || {};

  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get("page") ?? String(defaultPage));
  const search = searchParams.get("search") ?? defaultSearch;
  const status = searchParams.get("status") ?? defaultStatus;
  const type = searchParams.get("type") ?? defaultType;
  const sortBy = searchParams.get("sortBy") ?? defaultSortBy;
  const sortOrder = (searchParams.get("sortOrder") ??
    defaultSortOrder) as SortOrder;

  useEffect(() => {
    if (!ensurePageParam) return;
    if (!searchParams.get("page")) {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set("page", String(defaultPage));
        return next;
      });
    }
  }, [defaultPage, ensurePageParam, searchParams, setSearchParams]);

  // Helper to update multiple params at once
  const updateParams = (updates: Record<string, string | null>) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "" || value === "all") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      return params;
    });
  };

  // Individual setters for common params

  const setParam = (key: string, value: string | null) => {
    updateParams({ [key]: value });
  };

  //================= Pagination and filter setters =========================
  const setPage = (value: number) => {
    updateParams({ page: String(value) });
  };

  //================= Search, status, type setters =========================
  const setSearch = (value: string) => {
    updateParams({
      search: value || null,
      page: "1",
    });
  };

  //================= Status and type setters with "all" handling =========================
  const setStatus = (value: string) => {
    updateParams({
      status: value === "all" ? null : value,
      page: "1",
    });
  };

  //================= Type setter with "all" handling =========================
  const setType = (value: string) => {
    updateParams({
      type: value === "all" ? null : value,
      page: "1",
    });
  };

  //================= Sorting handler =========================
  const handleSort = (column: string) => {
    const nextOrder: SortOrder =
      sortBy === column && sortOrder === "ASC" ? "DESC" : "ASC";

    updateParams({
      sortBy: column,
      sortOrder: nextOrder,
      page: "1",
    });
  };

  //================= Reset handler =========================
  const reset = () => {
    setSearchParams({ page: String(defaultPage) });
  };

  return {
    searchParams,
    setSearchParams,
    page,
    search,
    status,
    type,
    sortBy,
    sortOrder,
    setParam,
    updateParams,
    setPage,
    setSearch,
    setStatus,
    setType,
    handleSort,
    reset,
  };
}
