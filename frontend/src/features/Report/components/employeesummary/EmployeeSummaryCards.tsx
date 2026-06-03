import {
  FiUsers,
  FiUserCheck,
  FiUserX,
  FiGrid,
  FiUserPlus,
} from "react-icons/fi";
import { useAnimatedCount } from "@/hooks/useAnimatedCount";
import type { EmployeeSummaryCards as EmployeeSummaryCardsType } from "@/features/Report/types/employeeSummaryReport.types";

const CARDS = [
  {
    key: "totalEmployees",
    label: "Total Employees",
    icon: <FiUsers className="h-5 w-5" />,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    key: "activeEmployees",
    label: "Active",
    icon: <FiUserCheck className="h-5 w-5" />,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    key: "inactiveEmployees",
    label: "Inactive",
    icon: <FiUserX className="h-5 w-5" />,
    color: "text-rose-600",
    bg: "bg-rose-50",
  },
  {
    key: "departmentCount",
    label: "Departments",
    icon: <FiGrid className="h-5 w-5" />,
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
  {
    key: "recentJoiners",
    label: "Recent Joiners",
    icon: <FiUserPlus className="h-5 w-5" />,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
] as const;

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-slate-100" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-20 rounded bg-slate-100" />
          <div className="h-6 w-12 rounded bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  icon,
  color,
  bg,
  raw,
}: {
  label: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  raw: number;
}) {
  const value = useAnimatedCount(raw, {
    durationMs: 800,
    decimals: 0,
  });

  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${bg} ${color}`}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500 leading-tight">
            {label}
          </p>
          <p className={`mt-1 text-2xl font-bold leading-none ${color}`}>
            {Math.round(value)}
          </p>
        </div>
      </div>
    </article>
  );
}

export default function EmployeeSummaryCards({
  stats,
  loading,
}: {
  stats: EmployeeSummaryCardsType;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        {CARDS.map((card) => (
          <SkeletonCard key={card.key} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
      {CARDS.map((card) => (
        <SummaryCard
          key={card.key}
          label={card.label}
          icon={card.icon}
          color={card.color}
          bg={card.bg}
          raw={Number(stats[card.key])}
        />
      ))}
    </div>
  );
}
