import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useUser } from "@/context/UserContext";
import { useUserFilters } from "./useUserFilters";
import { userService } from "@/features/users/services/user.service";
import type {
  AddUserFormValues,
  EditUserFormValues,
  User,
} from "@/features/users/types/user.types";

const PAGE_SIZE = 8;

export const useUsers = () => {
  const filters = useUserFilters({
    defaultSortBy: "createdAt",
    defaultSortOrder: "DESC",
  });

  const { user: currentUser } = useUser();
  const isAdmin = currentUser?.role === "admin";

  const [users, setUsers] = useState<User[]>([]);
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

  const viewId = filters.searchParams.get("view")
    ? Number(filters.searchParams.get("view"))
    : null;

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const payload = await userService.getEmployees({
        page: String(filters.page),
        limit: String(PAGE_SIZE),
        search: filters.search || null,
        status: filters.statusFilter === "all" ? null : filters.statusFilter,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      });
      setUsers(payload.data);
      setTotalRecords(payload.total);
      setTotalPages(payload.totalPages);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [
    filters.page,
    filters.search,
    filters.statusFilter,
    filters.sortBy,
    filters.sortOrder,
  ]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    if (!viewId || Number.isNaN(viewId)) return;
    let active = true;
    (async () => {
      try {
        const user = await userService.getEmployeeById(viewId);
        if (!active) return;
        setSelected(user);
      } catch {
        if (!active) return;
        toast.error("Failed to load user details");
        filters.setParam("view", null);
      }
    })();
    return () => {
      active = false;
    };
  }, [viewId, filters.setParam]);

  const closeAllModals = () => {
    setAddOpen(false);
    setEditOpen(false);
    setDeleteOpen(false);
    setSelected(null);
  };

  const openView = (user: User) => {
    setSelected(user);
    filters.setParam("view", String(user.id));
  };
  const closeView = () => filters.setParam("view", null);

  const openEdit = (user: User) => {
    setSelected(user);
    setEditOpen(true);
  };
  const openDelete = (user: User) => {
    setSelected(user);
    setDeleteOpen(true);
  };

  const handleDrawerEdit = (user: User) => {
    filters.setParam("view", null);
    openEdit(user);
  };
  const handleDrawerDeactivate = (user: User) => {
    filters.setParam("view", null);
    openDelete(user);
  };

  const handleCreate = async (formValues: AddUserFormValues) => {
    try {
      setIsCreating(true);
      await userService.create(formValues);
      toast.success(`${formValues.name} created successfully`);
      setAddOpen(false);
      await loadUsers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to create user");
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
      await loadUsers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to update user");
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
      setSelected(null);
      await loadUsers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to delete user");
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    // data
    users,
    totalRecords,
    totalPages,
    loading,
    selected,
    isAdmin,
    PAGE_SIZE,
    page: filters.page,
    // filter state (spread from useUserFilters)
    ...filters,
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
