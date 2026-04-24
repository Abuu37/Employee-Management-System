export type AttendanceRecord = {
  id: number;
  user_id: number;
  date: string;
  check_in: string | null;
  check_out: string | null;
  total_hours: number | string | null;
  status: "present" | "late" | "absent" | "half_day";
  user?: { name: string; email: string };
};

export const statusConfig = {
  present: {
    label: "Present",
    bg: "bg-green-50",
    text: "text-green-700",
    dot: "bg-green-500",
  },
  late: {
    label: "Late",
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },
  absent: {
    label: "Absent",
    bg: "bg-red-50",
    text: "text-red-700",
    dot: "bg-red-500",
  },
  half_day: {
    label: "Half Day",
    bg: "bg-blue-50",
    text: "text-blue-700",
    dot: "bg-blue-500",
  },
};

export const fmt = (time: string | null): string => {
  if (!time) return "—";
  return time.slice(0, 5);
};

export const fmtHours = (h: number | string | null): string => {
  if (h == null) return "—";
  const n = parseFloat(String(h));
  return isNaN(n) ? "—" : `${n.toFixed(1)}h`;
};
