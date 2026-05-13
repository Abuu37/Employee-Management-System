import { useTableQueryParams } from "@/Hook/useTableQueryParams";

interface FilterOptions {
  defaultSortBy?: string;
  defaultSortOrder?: string;
}

export const useUserFilters = (options?: FilterOptions) => {
  const {
    searchParams,
    page,
    search,
    status: statusFilter,
    sortBy,
    sortOrder,
    setPage,
    setSearch,
    setStatus,
    setParam,
    handleSort,
  } = useTableQueryParams({
    defaultSortBy: options?.defaultSortBy ?? "createdAt",
    defaultSortOrder: options?.defaultSortOrder ?? "DESC",
  });

  return {
    searchParams,
    page,
    search,
    statusFilter,
    sortBy,
    sortOrder,
    setPage,
    setSearch,
    setStatus,
    setParam,
    handleSort,
  };
};
