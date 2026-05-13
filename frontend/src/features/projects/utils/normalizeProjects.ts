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
    return {
      id: project.id,
      name: project.name,
      description: project.description ?? "",
      managerId,
      managerName: userNameById.get(managerId) || "Unknown Manager",
      startDate: project.startDate ?? project.start_date ?? "",
      endDate: project.endDate ?? project.end_date ?? "",
      status: project.status ?? "pending",
      deadline: project.deadline ?? project.deadline_date ?? "",
    };
  });
};
