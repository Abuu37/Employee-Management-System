export const statusConfig = {
  present: {
    label: "Present",
    chip: "border border-emerald-200 bg-emerald-50/90 text-emerald-700 shadow-xs",
    iconCls: "bg-emerald-100 text-emerald-600",
  },
  late: {
    label: "Late",
    chip: "border border-amber-200 bg-amber-50/90 text-amber-700 shadow-xs",
    iconCls: "bg-amber-100 text-amber-600",
  },
  absent: {
    label: "Absent",
    chip: "border border-red-200 bg-red-50/90 text-red-700 shadow-xs",
    iconCls: "bg-red-100 text-red-600",
  },
  half_day: {
    label: "Half Day",
    chip: "border border-blue-200 bg-blue-50/90 text-blue-700 shadow-xs",
    iconCls: "bg-blue-100 text-blue-600",
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
