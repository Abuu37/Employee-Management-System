import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useUser } from "@/context/UserContext";
import { useTableQueryParams } from "@/hooks/useTableQueryParams";
import { userService } from "@/features/users/services/user.service";
import type {
  AddUserFormValues,
  EditUserFormValues,
  User,
} from "@/features/users/types/user.types";

const PAGE_SIZE = 8;

export const useManagersPage = () => {
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
    defaultSortBy: "createdAt",
    defaultSortOrder: "DESC",
  });

  const { user } = useUser();
  const isAdmin = user?.role === "admin";

  const [managers, setManagers] = useState<User[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<User | null>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const viewId = searchParams.get("view")
    ? Number(searchParams.get("view"))
    : null;

  const loadManagers = useCallback(async () => {
    try {
      setLoading(true);
      const payload = await userService.getManagers({
        page: String(page),
        limit: String(PAGE_SIZE),
        search: search || null,
        status: statusFilter === "all" ? null : statusFilter,
        sortBy,
        sortOrder,
      });
      setManagers(payload.data);
      setTotalRecords(payload.total);
      setTotalPages(payload.totalPages);
    } catch {
      toast.error("Failed to load managers");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, sortBy, sortOrder]);

  useEffect(() => {
    void loadManagers();
  }, [loadManagers]);

  useEffect(() => {
    if (!viewId || Number.isNaN(viewId)) return;
    let active = true;
    (async () => {
      try {
        const manager = await userService.getManagerById(viewId);
        if (!active) return;
        setSelected(manager);
      } catch {
        if (!active) return;
        toast.error("Failed to load manager details");
        setParam("view", null);
      }
    })();
    return () => {
      active = false;
    };
  }, [viewId, setParam]);

  const closeAllModals = () => {
    setAddOpen(false);
    setEditOpen(false);
    setDeleteOpen(false);
    setSelected(null);
  };

  const openView = (manager: User) => {
    setSelected(manager);
    setParam("view", String(manager.id));
  };
  const closeView = () => setParam("view", null);

  const openEdit = (manager: User) => {
    setSelected(manager);
    setEditOpen(true);
  };
  const openDelete = (manager: User) => {
    setSelected(manager);
    setDeleteOpen(true);
  };

  const handleDrawerEdit = (manager: User) => {
    setParam("view", null);
    openEdit(manager);
  };
  const handleDrawerDeactivate = (manager: User) => {
    setParam("view", null);
    openDelete(manager);
  };

  const handleCreate = async (formValues: AddUserFormValues) => {
    try {
      setIsCreating(true);
      await userService.create(formValues);
      toast.success(`${formValues.name} created successfully`);
      setAddOpen(false);
      await loadManagers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to create manager");
    } finally {
      setIsCreating(false);
    }
  };

  const handleEdit = async (formValues: EditUserFormValues) => {
    if (!selected) return;
    try {
      setIsSaving(true);
      await userService.update(selected.id, formValues);
      toast.success(`${formValues.name} updated successfully`);
      setEditOpen(false);
      await loadManagers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to update manager");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    try {
      setIsDeleting(true);
      await userService.delete(selected.id);
      toast.success(`${selected.name} deleted successfully`);
      setDeleteOpen(false);
      setParam("view", null);
      setSelected(null);
      await loadManagers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to delete manager");
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    // data
    managers,
    totalRecords,
    totalPages,
    loading,
    selected,
    isAdmin,
    PAGE_SIZE,
    page,
    // query params
    search,
    statusFilter,
    sortBy,
    sortOrder,
    setPage,
    setSearch,
    setStatus,
    handleSort,
    // modal state
    addOpen,
    editOpen,
    deleteOpen,
    viewId,
    setAddOpen,
    isCreating,
    isSaving,
    isDeleting,
    // handlers
    openView,
    closeView,
    openEdit,
    openDelete,
    handleDrawerEdit,
    handleDrawerDeactivate,
    handleCreate,
    handleEdit,
    handleDelete,
    closeAllModals,
  };
};
