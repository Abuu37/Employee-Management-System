import type { RawUser } from "@/features/projects/types/project.types";

export const normalizeUsers = (payload: unknown): RawUser[] => {
  if (Array.isArray(payload)) {
    return payload as RawUser[];
  }

  if (payload && typeof payload === "object") {
    return [payload as RawUser];
  }

  return [];
};
