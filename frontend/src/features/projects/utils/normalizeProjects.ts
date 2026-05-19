import type {
  ProjectItem,
  RawProject,
} from "@/features/projects/types/project.types";

export const normalizeProjects = (
  data: RawProject[],
  userNameById: Map<number, string>,
): ProjectItem[] => {
  return data.map((project) => {
    const managerId = project.managerId ?? project.manager_id ?? 0;
    const managerName =
      project.managerName ??
      project.manager?.name ??
      userNameById.get(managerId) ??
      "Not assigned";

    return {
      id: project.id,
      name: project.name,
      code: project.code ?? undefined,
      description: project.description ?? "",
      managerId,
      managerName,
      startDate: project.startDate ?? project.start_date ?? "",
      endDate: project.endDate ?? project.end_date ?? "",
      status: project.status ?? "pending",
      priority: project.priority ?? undefined,
      deadline: project.deadline ?? project.deadline_date ?? "",
    };
  });
};
