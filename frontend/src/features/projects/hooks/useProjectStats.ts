import { useCallback, useState } from "react";
import type { ProjectStats } from "@/features/projects/types/project.types";
import { projectService } from "@/features/projects/services/project.service";

const defaultStats: ProjectStats = {
  total: 0,
  inProgress: 0,
  completed: 0,
  pending: 0,
};

export const useProjectStats = () => {
  const [stats, setStats] = useState<ProjectStats>(defaultStats);

  const refreshStats = useCallback(async () => {
    const next = await projectService.getProjectStats();
    setStats(next ?? defaultStats);
    return next ?? defaultStats;
  }, []);

  return {
    stats,
    setStats,
    refreshStats,
  };
};
