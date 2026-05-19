import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTableQueryParams } from "@/hooks/useTableQueryParams";
import { departmentService } from "@/features/departments/services/department.service";
import type {
  Department,
  DepartmentStats,
  DeptFormValues,
} from "@/features/departments/types/department.types";

const DEFAULT_STATS: DepartmentStats = {
  total: 0,
  active: 0,
  assigned: 0,
  totalEmployees: 0,
};

type DepartmentsCache = {
  key: string;
  departments: Department[];
  stats: DepartmentStats;
};

let departmentsCache: DepartmentsCache | null = null;

const buildCacheKey = (p: {
  page: number;
  search: string;
  statusFilter: string;
  sortBy: string;
  sortOrder: string;
}) => [p.page, p.search, p.statusFilter, p.sortBy, p.sortOrder].join("|");

export const useDepartmentsPage = () => {
  const {
    searchParams,
    page,
    search,
    status: statusFilter,
    sortBy,
    sortOrder,
    setParam,
    setSearch,
    setStatus,
    handleSort,
  } = useTableQueryParams({
    defaultSortBy: "createdAt",
    defaultSortOrder: "DESC",
  });

  const cacheKey = buildCacheKey({
    page,
    search,
    statusFilter,
    sortBy,
    sortOrder,
  });
  const cachedData =
    departmentsCache?.key === cacheKey ? departmentsCache : null;

  const [departments, setDepartments] = useState<Department[]>(
    () => cachedData?.departments ?? [],
  );
  const [stats, setStats] = useState<DepartmentStats>(
    () => cachedData?.stats ?? DEFAULT_STATS,
  );
  const [loading, setLoading] = useState(() => !cachedData);

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Department | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const viewId = searchParams.get("view")
    ? Number(searchParams.get("view"))
    : null;

  // ─── Load ────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!cachedData) return;
    setDepartments(cachedData.departments);
    setStats(cachedData.stats);
    setLoading(false);
  }, [cachedData]);

  const load = useCallback(async () => {
    try {
      const params: Record<string, string> = {
        page: String(page),
        sortBy,
        sortOrder,
      };
      if (search) params.search = search;
      if (statusFilter !== "all") params.status = statusFilter;

      const { departments: depts, stats: st } =
        await departmentService.getAll(params);
      setDepartments(depts);
      setStats(st);
      departmentsCache = { key: cacheKey, departments: depts, stats: st };
    } catch {
      toast.error("Failed to load departments");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, sortBy, sortOrder, cacheKey]);

  useEffect(() => {
    void load();
  }, [load]);

  // ─── View (URL-driven) ───────────────────────────────────────────────────────

  useEffect(() => {
    if (!viewId || Number.isNaN(viewId)) return;
    let active = true;
    (async () => {
      try {
        const full = await departmentService.getById(viewId);
        if (!active) return;
        setSelected(full);
      } catch {
        if (!active) return;
        toast.error("Failed to load department details");
        setParam("view", null);
      }
    })();
    return () => {
      active = false;
    };
  }, [viewId, setParam]);

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const openView = (dept: Department) => setParam("view", String(dept.id));
  const closeView = () => setParam("view", null);
  const openEdit = (dept: Department) => {
    setSelected(dept);
    setEditOpen(true);
  };

  const handleAdd = async (values: DeptFormValues) => {
    setIsSaving(true);
    try {
      await departmentService.create({
        ...values,
        manager_id: values.manager_id || null,
      });
      toast.success("Department created");
      setAddOpen(false);
      void load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to create");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = async (values: DeptFormValues) => {
    if (!selected) return;
    setIsSaving(true);
    try {
      await departmentService.update(selected.id, {
        ...values,
        manager_id: values.manager_id || null,
      });
      toast.success("Department updated");
      setEditOpen(false);
      void load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to update");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (dept: Department) => {
    setSelected(dept);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selected) return;
    setIsDeleting(true);
    try {
      await departmentService.delete(selected.id);
      toast.success("Department deleted");
      setDeleteOpen(false);
      setSelected(null);
      void load();
    } catch {
      toast.error("Failed to delete");
    } finally {
      setIsDeleting(false);
    }
  };

  const closeDelete = () => {
    setDeleteOpen(false);
    setSelected(null);
  };

  const handleToggle = async (dept: Department) => {
    try {
      const res = await departmentService.toggleStatus(dept.id);
      toast.success(`Department ${res.status}`);
      void load();
    } catch {
      toast.error("Failed to toggle status");
    }
  };

  return {
    // data
    departments,
    stats,
    loading,
    // query params
    page,
    search,
    statusFilter,
    sortBy,
    sortOrder,
    setSearch,
    setStatus,
    handleSort,
    // modal state
    addOpen,
    editOpen,
    deleteOpen,
    selected,
    viewId,
    setAddOpen,
    isSaving,
    isDeleting,
    // handlers
    openView,
    closeView,
    openEdit,
    handleAdd,
    handleEdit,
    handleDelete,
    confirmDelete,
    closeDelete,
    handleToggle,
  };
};
