import { useState } from "react";
import type { ProjectItem } from "@/features/projects/types/project.types";

export const useProjectModals = () => {
  const [activeProject, setActiveProject] = useState<ProjectItem | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const closeAllModals = (onClose?: () => void) => {
    setCreateOpen(false);
    setEditOpen(false);
    setViewOpen(false);
    setDeleteOpen(false);
    setActiveProject(null);
    if (onClose) onClose();
  };

  const openCreate = () => setCreateOpen(true);

  const openView = (project: ProjectItem) => {
    setActiveProject(project);
    setViewOpen(true);
  };

  const openEdit = (project: ProjectItem) => {
    setActiveProject(project);
    setEditOpen(true);
  };

  const openDelete = (project: ProjectItem) => {
    setActiveProject(project);
    setDeleteOpen(true);
  };

  return {
    activeProject,
    createOpen,
    viewOpen,
    editOpen,
    deleteOpen,
    setActiveProject,
    openCreate,
    openView,
    openEdit,
    openDelete,
    closeAllModals,
  };
};
